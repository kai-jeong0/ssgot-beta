import { useState, useEffect, useRef } from 'react';

// 환경 변수에서 API 키 가져오기 (빌드 시점에 대체됨)
const KAKAO_JAVASCRIPT_KEY = import.meta.env.VITE_KAKAO_JS_KEY || "cf29dccdc1b81db907bf3cab84679703";

// API 키 유효성 검사
const validateApiKey = (key) => {
  if (!key || key === "cf29dccdc1b81db907bf3cab84679703") {
    console.warn('⚠️ 기본 API 키가 사용되고 있습니다. 환경 변수 VITE_KAKAO_JS_KEY를 설정해주세요.');
    return false;
  }
  if (key.length < 20) {
    console.error('❌ API 키가 너무 짧습니다.');
    return false;
  }
  return true;
};

export const useKakaoMap = (mode) => {
  const [kakaoObj, setKakaoObj] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [markerMap, setMarkerMap] = useState({});
  const [currentInfo, setCurrentInfo] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const mapRef = useRef(null);

  // 카카오맵 SDK 로드
  const loadKakao = (key) => {
    return new Promise((resolve, reject) => {
      console.log('카카오맵 로딩 시작...', key);
      if (window.kakao && window.kakao.maps) {
        console.log('이미 로드된 카카오맵 사용');
        // 기존 로드된 객체에서 services 확인
        if (window.kakao.maps.services && window.kakao.maps.services.Directions) {
          console.log('✅ 기존 Directions 서비스 사용 가능');
          resolve(window.kakao);
        } else {
          console.warn('⚠️ 기존 객체에 Directions 서비스가 없음, 재로드 필요');
          // 기존 스크립트 제거 후 재로드
          const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
          if (existingScript) {
            existingScript.remove();
          }
          delete window.kakao;
        }
      }
      
      const script = document.createElement('script');
      // 카카오맵 가이드에 따라 services 라이브러리 명시적 포함
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${key}&libraries=services`;
      script.async = true;
      
      script.onload = () => {
        console.log('카카오맵 SDK 스크립트 로드 완료');
        if (!window.kakao) {
          console.error('카카오 객체를 찾을 수 없음');
          return reject(new Error('no kakao'));
        }
        
        // 카카오맵 초기화
        window.kakao.maps.load(() => {
          console.log('카카오맵 초기화 완료');
          
          // services 라이브러리 로드 확인 및 초기화
          if (window.kakao.maps.services) {
            console.log('✅ Services 라이브러리 로드 완료');
            
            // Directions 서비스 사용 가능 여부 확인
            if (window.kakao.maps.services.Directions) {
              console.log('✅ Directions 서비스 사용 가능');
            } else {
              console.warn('⚠️ Directions 서비스가 로드되지 않음');
            }
            
            // Places 서비스 사용 가능 여부 확인
            if (window.kakao.maps.services.Places) {
              console.log('✅ Places 서비스 사용 가능');
            } else {
              console.warn('⚠️ Places 서비스가 로드되지 않음');
            }
            
            // Geocoder 서비스 사용 가능 여부 확인
            if (window.kakao.maps.services.Geocoder) {
              console.log('✅ Geocoder 서비스 사용 가능');
            } else {
              console.warn('⚠️ Geocoder 서비스가 로드되지 않음');
            }
          } else {
            console.error('❌ Services 라이브러리 로드 실패');
            return reject(new Error('services library load failed'));
          }
          
          resolve(window.kakao);
        });
      };
      
      script.onerror = (e) => {
        console.error('카카오맵 SDK 로드 실패:', e);
        reject(new Error('sdk load error'));
      };
      
      document.head.appendChild(script);
    });
  };

  // 카카오맵 로드
  useEffect(() => {
    (async () => {
      try {
        // API 키 유효성 검사
        if (!validateApiKey(KAKAO_JAVASCRIPT_KEY)) {
          console.error('❌ 유효하지 않은 API 키입니다.');
          return;
        }
        
        console.log('🔑 API 키 검증 완료:', KAKAO_JAVASCRIPT_KEY.substring(0, 10) + '...');
        const kakao = await loadKakao(KAKAO_JAVASCRIPT_KEY);
        setKakaoObj(kakao);
      } catch (error) {
        console.error('카카오맵 로드 실패:', error);
      }
    })();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!kakaoObj || mode !== 'map') return;
    
    console.log('지도 초기화 시작...', mapRef.current);
    try {
      const center = new kakaoObj.maps.LatLng(37.4138, 127.5183); // 경기도 중심
      const newMap = new kakaoObj.maps.Map(mapRef.current, { 
        center, 
        level: 8, // 적절한 줌 레벨
        draggable: true, // 드래그 가능
        scrollwheel: true, // 마우스 휠 줌 가능
        keyboardShortcuts: true, // 키보드 단축키 사용
        disableDoubleClick: false, // 더블클릭 줌 활성화
        disableDoubleTap: false, // 더블탭 줌 활성화 (모바일)
        tileAnimation: true, // 타일 애니메이션 활성화
        zoomControl: true, // 줌 컨트롤 표시
        mapTypeControl: false, // 지도 타입 컨트롤 비활성화 (일반 지도만)
        scaleControl: true, // 축척 표시
        streetViewPanControl: false, // 거리뷰 컨트롤 비활성화
        overviewMapControl: false, // 개요 지도 컨트롤 비활성화
        fullscreenControl: false, // 전체화면 컨트롤 비활성화
        searchControl: false // 검색 컨트롤 비활성화
      });
      console.log('지도 생성 완료');
      setMap(newMap);
    } catch (error) {
      console.error('지도 초기화 실패:', error);
    }
  }, [kakaoObj, mode]);

  // 마커 관리 (성능 최적화)
  const updateMarkers = (stores, onMarkerClick, showInfoWindow = false, selectedId = null) => {
    if (!map || !kakaoObj) return;
    
    console.log(`마커 업데이트 시작: ${stores.length}개 업체, 선택된 ID: ${selectedId}`);
    
    // 기존 마커 제거
    markers.forEach(mk => mk.setMap(null));
    
    // 기본 마커 이미지 (쓰곳 커스텀 아이콘)
    const defaultMarker = new kakaoObj.maps.MarkerImage(
      '/assets/marker-default.svg',
      new kakaoObj.maps.Size(48, 49),
      { offset: new kakaoObj.maps.Point(24, 49) }
    );
    
    // 선택된 마커 이미지 (쓰곳 커스텀 선택 아이콘)
    const selectedMarker = new kakaoObj.maps.MarkerImage(
      '/assets/marker-selected.svg',
      new kakaoObj.maps.Size(48, 49),
      { offset: new kakaoObj.maps.Point(24, 49) }
    );
    
    const mm = {};
    const newMarkers = stores.map(store => {
      // 선택된 업체인지 확인하여 마커 이미지 결정
      const isSelected = selectedId === store.id;
      const markerImage = isSelected ? selectedMarker : defaultMarker;
      
      const marker = new kakaoObj.maps.Marker({
        position: new kakaoObj.maps.LatLng(store.lat, store.lng),
        title: store.name,
        image: markerImage
      });
      
      marker.setMap(map);
      
      // 마커 클릭 이벤트
      kakaoObj.maps.event.addListener(marker, 'click', () => {
        console.log(`🎯 마커 클릭: ${store.name} (ID: ${store.id})`);
        
        // 기존 정보창 닫기
        if (currentInfo) {
          currentInfo.close();
          setCurrentInfo(null);
        }
        
        // 모든 마커를 기본 이미지로 리셋
        Object.values(mm).forEach(m => {
          m.setImage(defaultMarker);
        });
        
        // 현재 마커를 선택된 이미지로 강조
        marker.setImage(selectedMarker);
        setSelectedMarkerId(store.id);
        
        // 콜백 실행 (하단 리스트 앵커링)
        onMarkerClick(store);
        
        console.log(`📍 ${store.name} 마커 하이라이팅 완료`);
      });
      
      mm[store.id] = marker;
      return marker;
    });
    
    // 선택 상태 업데이트
    if (selectedId) {
      setSelectedMarkerId(selectedId);
    }
    
    setMarkers(newMarkers);
    setMarkerMap(mm);
    
    console.log(`마커 업데이트 완료: ${newMarkers.length}개 마커 생성, 선택된 마커 하이라이팅 완료`);
  };

  // 마커 강조 해제
  const clearMarkerHighlight = () => {
    if (!map || !kakaoObj) return;
    
    console.log('마커 강조 해제 시작');
    
    // 기본 마커 이미지 생성
    const defaultMarker = new kakaoObj.maps.MarkerImage(
      '/assets/marker-default.svg',
      new kakaoObj.maps.Size(48, 49),
      { offset: new kakaoObj.maps.Point(24, 49) }
    );
    
    Object.values(markerMap).forEach(marker => {
      marker.setImage(defaultMarker);
    });
    
    // 선택 상태 리셋
    setSelectedMarkerId(null);
    
    console.log('마커 강조 해제 완료');
  };

  return {
    kakaoObj,
    map,
    mapRef,
    markers,
    markerMap,
    currentInfo,
    selectedMarkerId,
    updateMarkers,
    clearMarkerHighlight
  };
};
