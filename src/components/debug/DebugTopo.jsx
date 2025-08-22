import React, { useState, useEffect, useRef } from 'react';
import { 
  loadTopo, 
  toGeoJSON, 
  ensureLatLngOrder, 
  getBbox, 
  calculateBbox,
  getCenter,
  toKakaoPolygonPaths,
  getCoordSamples,
  getErrorMessage 
} from '../../../lib/geo/topo.ts';

/**
 * TopoJSON 디버그 테스트 페이지
 * 
 * TopoJSON → GeoJSON 변환 및 지도 렌더링 테스트
 */
function DebugTopo() {
  // 상태 관리
  const [healthStatus, setHealthStatus] = useState({
    loading: false,
    topoLoaded: false,
    geoConverted: false,
    featuresCount: 0,
    error: null,
    topology: null,
    geojson: null
  });
  
  const [mapStatus, setMapStatus] = useState({
    kakaoLoaded: false,
    mapReady: false,
    polygons: [],
    error: null
  });
  
  // 지도 관련
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [kakao, setKakao] = useState(null);

  // 카카오맵 초기화
  useEffect(() => {
    const initKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        setKakao(window.kakao);
        setMapStatus(prev => ({ ...prev, kakaoLoaded: true }));
        return;
      }

      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=cf29dccdc1b81db907bf3cab84679703&autoload=false&libraries=services`;
      script.onload = () => {
        window.kakao.maps.load(() => {
          setKakao(window.kakao);
          setMapStatus(prev => ({ ...prev, kakaoLoaded: true }));
        });
      };
      script.onerror = () => {
        setMapStatus(prev => ({ 
          ...prev, 
          error: '🔑 카카오맵 SDK 로드 실패: 허용 도메인에 http://localhost:5173을 등록해주세요.' 
        }));
      };
      document.head.appendChild(script);
    };

    initKakaoMap();
  }, []);

  // 지도 인스턴스 생성
  useEffect(() => {
    if (!kakao || !mapRef.current) return;

    try {
      const mapOptions = {
        center: new kakao.maps.LatLng(37.4, 127.2), // 경기도 중심
        level: 9
      };

      const mapInstance = new kakao.maps.Map(mapRef.current, mapOptions);
      setMap(mapInstance);
      setMapStatus(prev => ({ ...prev, mapReady: true }));
      
      console.log('✅ 카카오맵 초기화 완료');
    } catch (error) {
      console.error('❌ 카카오맵 초기화 실패:', error);
      setMapStatus(prev => ({ ...prev, error: getErrorMessage(error) }));
    }
  }, [kakao]);

  // 헬스체크 실행
  const runHealthCheck = async () => {
    setHealthStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 1. TopoJSON 로드
      console.log('🔍 Step 1: TopoJSON 로드');
      const topology = await loadTopo('/geo/gyeonggi/sig.topo.json');
      
      setHealthStatus(prev => ({ 
        ...prev, 
        topoLoaded: true, 
        topology 
      }));

      // 2. GeoJSON 변환
      console.log('🔍 Step 2: GeoJSON 변환');
      const geojson = toGeoJSON(topology, 'sig');
      
      setHealthStatus(prev => ({ 
        ...prev, 
        geoConverted: true, 
        featuresCount: geojson.features.length,
        geojson
      }));

      console.log('✅ 헬스체크 완료');
      
    } catch (error) {
      console.error('❌ 헬스체크 실패:', error);
      setHealthStatus(prev => ({ 
        ...prev, 
        error: getErrorMessage(error) 
      }));
    } finally {
      setHealthStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // 페이지 로드 시 헬스체크 자동 실행
  useEffect(() => {
    runHealthCheck();
  }, []);

  // 첫 번째 폴리곤 그리기
  const drawFirstPolygon = () => {
    if (!map || !kakao || !healthStatus.geojson) {
      alert('지도 또는 GeoJSON 데이터가 준비되지 않았습니다.');
      return;
    }

    try {
      // 기존 폴리곤 제거
      clearPolygons();
      
      const firstFeature = healthStatus.geojson.features[0];
      console.log('🎯 첫 번째 피처 그리기:', firstFeature.properties);
      
      // 좌표 변환
      const paths = toKakaoPolygonPaths(firstFeature);
      console.log('📍 변환된 경로 (lat,lng):', paths[0]?.slice(0, 3));
      
      // 폴리곤 생성
      const polygon = new kakao.maps.Polygon({
        path: paths[0], // 첫 번째 링만 사용
        strokeWeight: 2,
        strokeColor: '#FF7419',
        strokeOpacity: 0.8,
        fillColor: '#FF7419',
        fillOpacity: 0.3
      });
      
      polygon.setMap(map);
      setMapStatus(prev => ({ 
        ...prev, 
        polygons: [polygon] 
      }));
      
      // fitBounds
      const bbox = calculateBbox(firstFeature);
      const bounds = getBbox(bbox);
      const latLngBounds = new kakao.maps.LatLngBounds(
        new kakao.maps.LatLng(bounds.sw[0], bounds.sw[1]),
        new kakao.maps.LatLng(bounds.ne[0], bounds.ne[1])
      );
      map.setBounds(latLngBounds);
      
      console.log('✅ 첫 번째 폴리곤 그리기 완료');
      
    } catch (error) {
      console.error('❌ 첫 번째 폴리곤 그리기 실패:', error);
      setMapStatus(prev => ({ ...prev, error: getErrorMessage(error) }));
    }
  };

  // 전체 폴리곤 그리기
  const drawAllPolygons = () => {
    if (!map || !kakao || !healthStatus.geojson) {
      alert('지도 또는 GeoJSON 데이터가 준비되지 않았습니다.');
      return;
    }

    try {
      // 기존 폴리곤 제거
      clearPolygons();
      
      const newPolygons = [];
      
      healthStatus.geojson.features.forEach((feature, index) => {
        const paths = toKakaoPolygonPaths(feature);
        
        const polygon = new kakao.maps.Polygon({
          path: paths[0],
          strokeWeight: 1,
          strokeColor: '#D0D4DA',
          strokeOpacity: 0.8,
          fillColor: '#F7F8FA',
          fillOpacity: 0.6
        });
        
        // 호버 이벤트
        kakao.maps.event.addListener(polygon, 'mouseover', () => {
          polygon.setOptions({
            fillColor: '#FF7419',
            fillOpacity: 0.2,
            strokeWeight: 2,
            strokeColor: '#FF7419'
          });
        });
        
        kakao.maps.event.addListener(polygon, 'mouseout', () => {
          polygon.setOptions({
            fillColor: '#F7F8FA',
            fillOpacity: 0.6,
            strokeWeight: 1,
            strokeColor: '#D0D4DA'
          });
        });
        
        // 클릭 이벤트
        kakao.maps.event.addListener(polygon, 'click', () => {
          alert(`클릭된 지역: ${feature.properties.name || feature.id}`);
        });
        
        polygon.setMap(map);
        newPolygons.push(polygon);
      });
      
      setMapStatus(prev => ({ 
        ...prev, 
        polygons: newPolygons 
      }));
      
      // 전체 영역 fitBounds
      if (healthStatus.topology.bbox) {
        const bounds = getBbox(healthStatus.topology.bbox);
        const latLngBounds = new kakao.maps.LatLngBounds(
          new kakao.maps.LatLng(bounds.sw[0], bounds.sw[1]),
          new kakao.maps.LatLng(bounds.ne[0], bounds.ne[1])
        );
        map.setBounds(latLngBounds);
      }
      
      console.log(`✅ 전체 폴리곤 그리기 완료: ${newPolygons.length}개`);
      
    } catch (error) {
      console.error('❌ 전체 폴리곤 그리기 실패:', error);
      setMapStatus(prev => ({ ...prev, error: getErrorMessage(error) }));
    }
  };

  // 폴리곤 제거
  const clearPolygons = () => {
    mapStatus.polygons.forEach(polygon => polygon.setMap(null));
    setMapStatus(prev => ({ ...prev, polygons: [], error: null }));
    console.log('🧹 폴리곤 제거 완료');
  };

  // 헬스체크 카드 렌더링
  const renderHealthCard = () => {
    const { loading, topoLoaded, geoConverted, featuresCount, error, geojson } = healthStatus;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          🏥 헬스체크 카드
          <button
            onClick={runHealthCheck}
            className="ml-3 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새로고침
          </button>
        </h2>
        
        {loading && (
          <div className="flex items-center text-blue-600 mb-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            체크 중...
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-3">
          {/* TopoJSON 로드 상태 */}
          <div className="flex items-center">
            <span className={`mr-3 ${topoLoaded ? 'text-green-500' : 'text-gray-400'}`}>
              {topoLoaded ? '✅' : '⏳'}
            </span>
            <span className="text-sm">
              /geo/gyeonggi/sig.topo.json 로드
              {topoLoaded && ' (200 OK)'}
            </span>
          </div>
          
          {/* objects.sig 존재 여부 */}
          <div className="flex items-center">
            <span className={`mr-3 ${topoLoaded ? 'text-green-500' : 'text-gray-400'}`}>
              {topoLoaded ? '✅' : '⏳'}
            </span>
            <span className="text-sm">
              objects.sig 존재 여부
            </span>
          </div>
          
          {/* GeoJSON 변환 */}
          <div className="flex items-center">
            <span className={`mr-3 ${geoConverted ? 'text-green-500' : 'text-gray-400'}`}>
              {geoConverted ? '✅' : '⏳'}
            </span>
            <span className="text-sm">
              topojson.feature() 변환
              {geoConverted && ` (${featuresCount}개 features)`}
            </span>
          </div>
        </div>
        
        {/* 첫 피처 정보 */}
        {geojson && geojson.features[0] && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold text-sm mb-2">📋 첫 번째 피처 정보</h3>
            <div className="bg-gray-50 rounded p-3 text-xs space-y-1">
              <div><strong>ID:</strong> {geojson.features[0].id}</div>
              <div><strong>이름:</strong> {geojson.features[0].properties.name}</div>
              <div><strong>코드:</strong> {geojson.features[0].properties.code}</div>
              <div><strong>중심점:</strong> {JSON.stringify(geojson.features[0].properties.center)}</div>
              
              <div className="pt-2">
                <strong>좌표 샘플 (3점):</strong>
                <pre className="mt-1 text-xs text-gray-600">
                  {JSON.stringify(getCoordSamples(geojson.features[0]), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🗺️ TopoJSON 디버그</h1>
          <p className="text-gray-600">TopoJSON → GeoJSON 변환 및 지도 렌더링 테스트</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측: 헬스체크 카드 */}
          <div>
            {renderHealthCard()}
          </div>
          
          {/* 우측: 지도 컨테이너 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🗺️ 지도 렌더링 테스트</h2>
              <div className="text-sm text-gray-500">
                {mapStatus.kakaoLoaded ? '✅ SDK 로드됨' : '⏳ SDK 로딩...'}
              </div>
            </div>
            
            {/* 컨트롤 버튼 */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={drawFirstPolygon}
                disabled={!mapStatus.mapReady || !healthStatus.geoConverted}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                A. Draw First Polygon
              </button>
              <button
                onClick={drawAllPolygons}
                disabled={!mapStatus.mapReady || !healthStatus.geoConverted}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                B. Draw All
              </button>
              <button
                onClick={clearPolygons}
                disabled={!mapStatus.mapReady}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                C. Clear
              </button>
            </div>
            
            {/* 에러 표시 */}
            {mapStatus.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-700 text-sm">{mapStatus.error}</p>
              </div>
            )}
            
            {/* 지도 컨테이너 */}
            <div 
              ref={mapRef} 
              className="w-full h-96 border border-gray-200 rounded"
              style={{ minHeight: '560px' }}
            >
              {!mapStatus.mapReady && (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">지도 로딩 중...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* 상태 정보 */}
            <div className="mt-4 text-xs text-gray-500">
              <div>폴리곤 개수: {mapStatus.polygons.length}</div>
              <div>지도 상태: {mapStatus.mapReady ? '준비됨' : '로딩 중'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebugTopo;
