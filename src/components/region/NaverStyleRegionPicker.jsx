import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  loadGyeonggiSig, 
  loadGyeonggiEmd, 
  centroid, 
  toLatLngPaths, 
  toBounds, 
  getBounds 
} from '../../../lib/geo/topo.js';

/**
 * 네이버 부동산 스타일 지역 선택 컴포넌트
 * 
 * @description 지도 상호작용으로 경기도 시·군 → 읍/면/동 선택
 * - 폴리곤 Hover/Click 하이라이트
 * - 브레드크럼/드롭다운과 지도 상태 양방향 동기화
 * - 미니맵(오버뷰) + 줌/팬
 * - 지도 + 브레드크럼/드롭다운만 제공 (하단 리스트 없음)
 * 
 * @props
 * - initialProvince?: string ('경기도')
 * - onSelect: (selection) => void
 * - className?: string
 */

function NaverStyleRegionPicker({ 
  initialProvince = '경기도', 
  onSelect, 
  className = '' 
}) {
  // 상태 관리
  const [level, setLevel] = useState('sig'); // 'sig' | 'emd'
  const [selectedSig, setSelectedSig] = useState(null);
  const [selectedEmd, setSelectedEmd] = useState(null);
  
  // 드롭다운 제거: 지도 선택형만 사용
  
  // 지도 데이터
  const [sigData, setSigData] = useState(null);
  const [emdData, setEmdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 지도 관련
  const [map, setMap] = useState(null);
  const [kakao, setKakao] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [hoveredPolygon, setHoveredPolygon] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  
  const mapRef = useRef(null);
  const minimapRef = useRef(null);
  const [minimap, setMinimap] = useState(null);
  const [minimapPolygons, setMinimapPolygons] = useState([]);
  const [viewportIndicator, setViewportIndicator] = useState(null);

  // 카카오맵 로드
  useEffect(() => {
    const initKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        setKakao(window.kakao);
        return;
      }

      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=cf29dccdc1b81db907bf3cab84679703&autoload=false&libraries=services`;
      script.onload = () => {
        window.kakao.maps.load(() => {
          setKakao(window.kakao);
        });
      };
      document.head.appendChild(script);
    };

    initKakaoMap();
  }, []);

  // 메인 지도 초기화
  useEffect(() => {
    if (!kakao || !mapRef.current) return;

    const mapOptions = {
      center: new kakao.maps.LatLng(37.4, 127.2), // 경기도 중심
      level: 9, // 줌 레벨
      mapTypeId: kakao.maps.MapTypeId.ROADMAP
    };

    const mapInstance = new kakao.maps.Map(mapRef.current, mapOptions);
    setMap(mapInstance);

    // 지도 컨트롤 추가
    const zoomControl = new kakao.maps.ZoomControl();
    mapInstance.addControl(zoomControl, kakao.maps.ControlPosition.TOPRIGHT);

  }, [kakao]);

  // 미니맵 초기화
  useEffect(() => {
    if (!kakao || !minimapRef.current || !map) return;

    const minimapOptions = {
      center: new kakao.maps.LatLng(37.4, 127.2),
      level: 12, // 더 넓은 뷰 (경기도 전체)
      mapTypeId: kakao.maps.MapTypeId.ROADMAP,
      scrollwheel: false,
      disableDoubleClick: true,
      draggable: false
    };

    const minimapInstance = new kakao.maps.Map(minimapRef.current, minimapOptions);
    setMinimap(minimapInstance);

    // 메인 지도 이동 시 미니맵의 뷰포트 인디케이터 업데이트
    const updateViewportIndicator = () => {
      if (viewportIndicator) {
        viewportIndicator.setMap(null);
      }
      
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      
      // 뷰포트 직사각형 생성
      const rectangle = new kakao.maps.Rectangle({
        bounds: new kakao.maps.LatLngBounds(sw, ne),
        strokeWeight: 2,
        strokeColor: '#FF7419',
        strokeOpacity: 0.8,
        fillColor: '#FF7419',
        fillOpacity: 0.2
      });
      
      rectangle.setMap(minimapInstance);
      setViewportIndicator(rectangle);
    };

    // 이벤트 리스너 등록
    kakao.maps.event.addListener(map, 'bounds_changed', updateViewportIndicator);
    kakao.maps.event.addListener(map, 'zoom_changed', updateViewportIndicator);
    
    // 초기 뷰포트 인디케이터 설정
    updateViewportIndicator();

    // 미니맵 클릭으로 메인 지도 이동
    kakao.maps.event.addListener(minimapInstance, 'click', (mouseEvent) => {
      const clickPosition = mouseEvent.latLng;
      map.setCenter(clickPosition);
    });

  }, [kakao, map, viewportIndicator]);

  // 미니맵에 경기도 외곽선 표시
  const renderMinimapOutline = useCallback(() => {
    if (!minimap || !kakao || !sigData) return;

    // 기존 미니맵 폴리곤 제거
    minimapPolygons.forEach(polygon => polygon.setMap(null));
    
    const newMinimapPolygons = [];

    // 경기도 전체 외곽선만 얇게 표시
    sigData.features.forEach(feature => {
      const paths = toLatLngPaths(feature, kakao);
      
      if (paths.length === 0) return;

      const outlinePolygon = new kakao.maps.Polygon({
        path: paths[0],
        strokeWeight: 1,
        strokeColor: '#D0D4DA',
        strokeOpacity: 0.6,
        fillColor: '#F7F8FA',
        fillOpacity: 0.3
      });

      outlinePolygon.setMap(minimap);
      newMinimapPolygons.push(outlinePolygon);
    });

    setMinimapPolygons(newMinimapPolygons);
  }, [minimap, kakao, sigData, minimapPolygons]);

  // 초기 데이터 로드
  useEffect(() => {
    if (!kakao) return;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🗺️ 경기도 시·군 데이터 로드 중...');
        const data = await loadGyeonggiSig();
        setSigData(data);
        console.log(`✅ ${data.features.length}개 시·군 로드 완료`);
        
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [kakao]);

  // 미니맵 외곽선 렌더링
  useEffect(() => {
    if (minimap && sigData) {
      renderMinimapOutline();
    }
  }, [minimap, sigData, renderMinimapOutline]);

  // 폴리곤 스타일
  const getPolygonStyle = useCallback((feature, isHovered, isSelected) => {
    let fillColor = '#F7F8FA';
    let strokeColor = '#D0D4DA';
    let strokeWeight = 1;
    let fillOpacity = 0.6;

    if (isSelected) {
      fillColor = '#FF7419';
      fillOpacity = 0.15;
      strokeColor = '#FF7419';
      strokeWeight = 2;
    } else if (isHovered) {
      fillColor = '#000000';
      fillOpacity = 0.04;
      strokeWeight = 2;
    }

    return {
      fillColor,
      fillOpacity,
      strokeColor,
      strokeWeight,
      strokeOpacity: 0.8
    };
  }, []);

  // 폴리곤 렌더링
  const renderPolygons = useCallback((data, currentLevel) => {
    if (!map || !kakao || !data) return;

    // 기존 폴리곤 제거
    polygons.forEach(polygon => polygon.setMap(null));
    
    const newPolygons = [];

    data.features.forEach(feature => {
      const paths = toLatLngPaths(feature, kakao);
      
      if (paths.length === 0) return;

      const isHovered = hoveredPolygon?.properties.code === feature.properties.code;
      const isSelected = (currentLevel === 'sig' ? selectedSig?.properties.code : selectedEmd?.properties.code) === feature.properties.code;
      
      const style = getPolygonStyle(feature, isHovered, isSelected);

      const polygon = new kakao.maps.Polygon({
        path: paths[0], // 첫 번째 링만 사용 (간단한 폴리곤)
        ...style
      });

      // 이벤트 리스너
      kakao.maps.event.addListener(polygon, 'mouseover', () => {
        setHoveredPolygon(feature);
        polygon.setOptions(getPolygonStyle(feature, true, isSelected));
      });

      kakao.maps.event.addListener(polygon, 'mouseout', () => {
        setHoveredPolygon(null);
        polygon.setOptions(getPolygonStyle(feature, false, isSelected));
      });

      kakao.maps.event.addListener(polygon, 'click', () => {
        handlePolygonClick(feature, currentLevel);
      });

      polygon.setMap(map);
      newPolygons.push(polygon);

      // 라벨 추가
      const center = centroid(feature);
      const labelPosition = new kakao.maps.LatLng(center[1], center[0]);
      
      const labelContent = `<div style="
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: ${currentLevel === 'sig' ? '12px' : '10px'};
        font-weight: 500;
        color: #333;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">${feature.properties.name}</div>`;

      const customOverlay = new kakao.maps.CustomOverlay({
        position: labelPosition,
        content: labelContent,
        yAnchor: 0.5
      });

      customOverlay.setMap(map);
      newPolygons.push(customOverlay); // 라벨도 함께 관리
    });

    setPolygons(newPolygons);
  }, [map, kakao, polygons, hoveredPolygon, selectedSig, selectedEmd, getPolygonStyle]);

  // 폴리곤 클릭 핸들러
  const handlePolygonClick = async (feature, currentLevel) => {
    try {
      if (currentLevel === 'sig') {
        // 시·군 선택
        console.log('🎯 시·군 선택:', feature.properties.name);
        setSelectedSig(feature);
        setSelectedEmd(null);
        
        // 읍면동 데이터 로드
        setLoading(true);
        const emdFeatures = await loadGyeonggiEmd(feature.properties.code);
        setEmdData(emdFeatures);
        setLevel('emd');
        
        // 지도 중심 이동 및 줌
        const bbox = getBounds(feature);
        const bounds = toBounds(bbox, kakao);
        map.setBounds(bounds);
        
        console.log(`✅ ${feature.properties.name} 읍면동 ${emdFeatures.features.length}개 로드 완료`);
        
      } else if (currentLevel === 'emd') {
        // 읍면동 선택
        console.log('🎯 읍면동 선택:', feature.properties.name);
        setSelectedEmd(feature);
        
        // 최종 선택 완료
        const selection = {
          province: initialProvince,
          sig: {
            code: selectedSig.properties.code,
            name: selectedSig.properties.name
          },
          emd: {
            code: feature.properties.code,
            name: feature.properties.name
          }
        };
        
        console.log('✅ 지역 선택 완료:', selection);
        onSelect?.(selection);
      }
    } catch (error) {
      console.error('폴리곤 클릭 처리 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 현재 레벨에 따른 데이터 렌더링
  useEffect(() => {
    if (level === 'sig' && sigData) {
      renderPolygons(sigData, 'sig');
    } else if (level === 'emd' && emdData) {
      renderPolygons(emdData, 'emd');
    }
  }, [level, sigData, emdData, renderPolygons]);

  // 브레드크럼 네비게이션
  const handleBreadcrumbClick = (targetLevel) => {
    if (targetLevel === 'sig') {
      setLevel('sig');
      setSelectedEmd(null);
      setEmdData(null);
      
      if (map && kakao) {
        // 경기도 전체 뷰로 복귀
        const center = new kakao.maps.LatLng(37.4, 127.2);
        map.setCenter(center);
        map.setLevel(9);
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">지도 데이터 로드 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-red-600">
          <p className="mb-2">⚠️ 데이터 로드 실패</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* 브레드크럼 네비게이션 (상태 표시 및 상위 이동만) */}
      <div className="bg-white border-b p-4">
        <nav className="flex items-center space-x-2 text-sm">
          {/* 경기도 선택 */}
          <span className="text-gray-900 font-medium">{initialProvince}</span>
          
          {/* 시·군 선택 상태 표시 */}
          <span className="text-gray-400">›</span>
          <span className="text-blue-700">
            {selectedSig ? selectedSig.properties.name : '지도를 클릭해 시·군 선택'}
          </span>
          
          {/* 읍면동 선택 상태 표시 */}
          {selectedSig && (
            <>
              <span className="text-gray-400">›</span>
              <span className="text-blue-700">
                {selectedEmd ? selectedEmd.properties.name : '지도를 클릭해 읍/면/동 선택'}
              </span>
            </>
          )}
          
          {/* 뒤로가기 버튼 */}
          {level === 'emd' && (
            <button
              onClick={() => handleBreadcrumbClick('sig')}
              className="ml-4 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 시·군으로 돌아가기
            </button>
          )}
        </nav>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        {/* 메인 지도 */}
        <div ref={mapRef} className="w-full h-full" />
        
        {/* 미니맵 */}
        <div className="absolute top-4 right-4 w-40 h-32 border-2 border-white shadow-lg rounded overflow-hidden bg-white">
          <div className="relative w-full h-full">
            <div ref={minimapRef} className="w-full h-full" />
            <div className="absolute bottom-1 left-1 text-xs text-gray-500 bg-white bg-opacity-75 px-1 rounded">
              경기도
            </div>
            <div className="absolute top-1 right-1 text-xs text-orange-600 bg-white bg-opacity-75 px-1 rounded">
              ●
            </div>
          </div>
        </div>
        
        {/* 호버 정보 */}
        {hoveredPolygon && (
          <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg border">
            <div className="text-sm font-medium text-gray-900">
              {hoveredPolygon.properties.name}
            </div>
            <div className="text-xs text-gray-600">
              클릭하여 {level === 'sig' ? '읍면동 보기' : '선택'}
            </div>
          </div>
        )}
        
        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">데이터 로드 중...</p>
            </div>
          </div>
        )}
      </div>

      {/* 하단 상태 바 */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600">
        {level === 'sig' && `${sigData?.features.length || 0}개 시·군`}
        {level === 'emd' && selectedSig && `${selectedSig.properties.name} - ${emdData?.features.length || 0}개 읍면동`}
        {selectedEmd && ' | 선택 완료 ✓'}
      </div>
    </div>
  );
}

export default NaverStyleRegionPicker;
