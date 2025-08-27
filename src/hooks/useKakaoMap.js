import { useState, useEffect, useRef } from 'react';

// 환경 변수에서 API 키 가져오기 (여러 방법으로 시도)
const getKakaoApiKey = () => {
  // 1. Vite 환경 변수 (우선)
  if (import.meta.env.VITE_KAKAO_JS_KEY) {
    console.log('🔑 Vite 환경 변수에서 API 키 로드됨');
    return import.meta.env.VITE_KAKAO_JS_KEY;
  }
  
  // 2. Vite define을 통한 전역 변수
  if (typeof __KAKAO_API_KEY__ !== 'undefined' && __KAKAO_API_KEY__) {
    console.log('🔑 Vite define에서 API 키 로드됨');
    return __KAKAO_API_KEY__;
  }
  
  // 3. 기본값 (개발용)
  console.warn('⚠️ 환경 변수에서 API 키를 찾을 수 없음. 기본값 사용');
  return "cf29dccdc1b81db907bf3cab84679703";
};

const KAKAO_JAVASCRIPT_KEY = getKakaoApiKey();

// API 키 유효성 검사
const validateApiKey = (key) => {
  console.log('🔑 API 키 검증 시작:', key ? key.substring(0, 10) + '...' : 'undefined');
  
  if (!key) {
    console.error('❌ API 키가 설정되지 않았습니다. 환경 변수 VITE_KAKAO_JS_KEY를 확인해주세요.');
    return false;
  }
  
  if (key.length < 20) {
    console.error('❌ API 키가 너무 짧습니다:', key.length);
    return false;
  }
  
  console.log('✅ API 키 검증 통과');
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
      console.log('🗺️ 카카오맵 로딩 시작...', key ? key.substring(0, 10) + '...' : 'undefined');
      
      // 이미 로드된 경우 확인
      if (window.kakao && window.kakao.maps) {
        console.log('✅ 이미 로드된 카카오맵 사용');
        // 기존 로드된 객체에서 services 확인
        if (window.kakao.maps.services && window.kakao.maps.services.Directions) {
          console.log('✅ 기존 Directions 서비스 사용 가능');
          resolve(window.kakao);
          return;
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
      
      // 로딩 타임아웃 설정
      const timeoutId = setTimeout(() => {
        console.error('❌ 카카오맵 SDK 로딩 타임아웃');
        reject(new Error('SDK loading timeout'));
      }, 15000); // 15초 타임아웃
      
      script.onload = () => {
        clearTimeout(timeoutId);
        console.log('✅ 카카오맵 SDK 스크립트 로드 완료');
        
        if (!window.kakao) {
          console.error('❌ 카카오 객체를 찾을 수 없음');
          return reject(new Error('no kakao'));
        }
        
        // 카카오맵 초기화
        window.kakao.maps.load(() => {
          console.log('✅ 카카오맵 초기화 완료');
          
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
        clearTimeout(timeoutId);
        console.error('❌ 카카오맵 SDK 로드 실패:', e);
        reject(new Error('sdk load error'));
      };
      
      document.head.appendChild(script);
    });
  };

  // 카카오맵 로드
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoad = async () => {
      try {
        // API 키 유효성 검사
        if (!validateApiKey(KAKAO_JAVASCRIPT_KEY)) {
          console.error('❌ 유효하지 않은 API 키입니다.');
          return;
        }
        
        // 프로덕션 환경에서 API 키 노출 방지
        if (import.meta.env.PROD) {
          console.log('🔑 API 키 검증 완료 (프로덕션 모드)');
        } else {
          console.log('🔑 API 키 검증 완료:', KAKAO_JAVASCRIPT_KEY.substring(0, 10) + '...');
        }
        
        const kakao = await loadKakao(KAKAO_JAVASCRIPT_KEY);
        setKakaoObj(kakao);
        console.log('✅ 카카오맵 로드 성공');
      } catch (error) {
        console.error(`❌ 카카오맵 로드 실패 (시도 ${retryCount + 1}/${maxRetries}):`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`🔄 ${retryCount}초 후 재시도...`);
          setTimeout(attemptLoad, retryCount * 1000);
        } else {
          console.error('❌ 최대 재시도 횟수 초과. 카카오맵을 로드할 수 없습니다.');
        }
      }
    };
    
    attemptLoad();
  }, []);

  // 지도 초기화
  useEffect(() => {
    console.log('🗺️ 지도 초기화 useEffect 실행:', { 
      hasKakaoObj: !!kakaoObj, 
      mode, 
      mapRef: !!mapRef.current,
      mapRefElement: mapRef.current
    });
    
    // 환경 변수 디버깅 (임시)
    console.log('🔍 환경 변수 상태:', {
      VITE_KAKAO_JS_KEY: import.meta.env.VITE_KAKAO_JS_KEY,
      __KAKAO_API_KEY__: typeof __KAKAO_API_KEY__ !== 'undefined' ? __KAKAO_API_KEY__ : 'undefined',
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      currentKey: KAKAO_JAVASCRIPT_KEY ? KAKAO_JAVASCRIPT_KEY.substring(0, 10) + '...' : 'undefined'
    });
    
    if (!kakaoObj) {
      console.log('❌ kakaoObj가 없음 - 지도 초기화 건너뜀');
      return;
    }
    
    if (mode !== 'map') {
      console.log('❌ mode가 map이 아님:', mode, '- 지도 초기화 건너뜀');
      return;
    }
    
    if (!mapRef.current) {
      console.error('❌ mapRef.current가 없음 - 지도 초기화 건너뜀');
      return;
    }
    
    console.log('✅ 지도 초기화 조건 충족, 지도 생성 시작...');
    console.log('📍 mapRef 요소:', mapRef.current);
    console.log('📍 mapRef 크기:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
    
    // DOM 마운트 완료를 보장하기 위해 약간의 지연
    setTimeout(() => {
      try {
        const center = new kakaoObj.maps.LatLng(37.4138, 127.5183); // 경기도 중심
        console.log('📍 지도 중심 좌표 설정:', center);
        
        const mapOptions = { 
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
        };
        
        console.log('🗺️ 지도 옵션 설정 완료:', mapOptions);
        
        const newMap = new kakaoObj.maps.Map(mapRef.current, mapOptions);
        console.log('✅ 지도 생성 완료:', newMap);
        
        setMap(newMap);
        
        // 지도 로드 완료 이벤트 리스너 추가
        kakaoObj.maps.event.addListener(newMap, 'tilesloaded', () => {
          console.log('✅ 지도 타일 로드 완료');
        });
        
        kakaoObj.maps.event.addListener(newMap, 'zoom_changed', () => {
          console.log('🔍 지도 줌 레벨 변경:', newMap.getLevel());
        });
        
      } catch (error) {
        console.error('❌ 지도 초기화 실패:', error);
        console.error('에러 상세:', {
          message: error.message,
          stack: error.stack,
          kakaoObj: !!kakaoObj,
          kakaoMaps: !!(kakaoObj && kakaoObj.maps),
          mapRef: !!mapRef.current
        });
      }
    }, 100); // 100ms 지연으로 DOM 마운트 완료 보장
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
