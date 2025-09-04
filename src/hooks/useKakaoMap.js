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

export default function useKakaoMap(mode, key = 'default') {
  console.log('🔄 useKakaoMap 훅 실행, mode:', mode, 'key:', key);
  
  const [kakaoObj, setKakaoObj] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [markerMap, setMarkerMap] = useState({});
  const [currentInfo, setCurrentInfo] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const mapRef = useRef(null);

  // mode 변경 감지
  useEffect(() => {
    console.log('🔄 mode 변경 감지:', mode, 'key:', key);
  }, [mode, key]);

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
              console.warn('⚠️ 로드된 서비스:', Object.keys(window.kakao.maps.services));
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
            
            resolve(window.kakao);
          } else {
            console.error('❌ Services 라이브러리 로드 실패');
            return reject(new Error('services library load failed'));
          }
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
    
    // mode가 map이 아니면 지도 초기화 건너뜀
    if (mode !== 'map') {
      console.log('❌ mode가 map이 아님:', mode, '- 지도 초기화 건너뜀');
      return;
    }
    
    // kakaoObj가 없으면 지도 초기화 건너뜀
    if (!kakaoObj) {
      console.log('❌ kakaoObj가 없음 - 지도 초기화 건너뜀');
      return;
    }
    
    // mapRef가 없으면 지도 초기화 건너뜀
    if (!mapRef.current) {
      console.error('❌ mapRef.current가 없음 - 지도 초기화 건너뜀');
      return;
    }
    
    // 이미 지도가 있으면 초기화 건너뜀
    if (map) {
      console.log('✅ 이미 지도가 존재함 - 초기화 건너뜀');
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
        console.log('✅ 지도 상태 업데이트 완료');
        
        // 지도 로드 완료 이벤트 리스너 추가
        kakaoObj.maps.event.addListener(newMap, 'tilesloaded', () => {
          console.log('✅ 지도 타일 로드 완료');
          // 지도 로드 완료 후 현재 위치 표시 (stores 데이터는 나중에 전달됨)
          setTimeout(() => {
            getCurrentLocation();
          }, 500);
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
  }, [kakaoObj, mode, key]);

  // 마커 관리 (성능 최적화)
  const updateMarkers = (stores, onMarkerClick, showInfoWindow = false, selectedId = null) => {
    if (!map || !kakaoObj) {
      console.warn('⚠️ 마커 업데이트 실패: map 또는 kakaoObj가 없음');
      return;
    }
    
    if (!stores || !Array.isArray(stores) || stores.length === 0) {
      console.warn('⚠️ 마커 업데이트 실패: 유효하지 않은 stores 데이터');
      // 기존 마커 제거
      markers.forEach(mk => mk.setMap(null));
      setMarkers([]);
      setMarkerMap({});
      setSelectedMarkerId(null);
      return;
    }
    
    console.log(`마커 업데이트 시작: ${stores.length}개 업체, 선택된 ID: ${selectedId}`);
    console.log('📍 지도 객체:', map);
    console.log('📍 카카오 객체:', kakaoObj);
    
    // 업체 데이터 유효성 검사
    const validStores = stores.filter(store => {
      if (!store || !store.id || !store.name || 
          typeof store.lat !== 'number' || typeof store.lng !== 'number' ||
          isNaN(store.lat) || isNaN(store.lng)) {
        console.warn('⚠️ 유효하지 않은 업체 데이터:', store);
        return false;
      }
      return true;
    });
    
    if (validStores.length === 0) {
      console.warn('⚠️ 유효한 업체 데이터가 없음');
      // 기존 마커 제거
      markers.forEach(mk => mk.setMap(null));
      setMarkers([]);
      setMarkerMap({});
      setSelectedMarkerId(null);
      return;
    }
    
    console.log(`📍 유효한 업체: ${validStores.length}개`);
    
    // 기존 마커 제거
    markers.forEach(mk => mk.setMap(null));
    console.log(`📍 기존 마커 ${markers.length}개 제거 완료`);
    
    // SVG 마커 이미지 생성 (일반적인 카카오맵 마커 방식)
    const createMarkerImage = (svgPath) => {
      try {
        return new kakaoObj.maps.MarkerImage(
          svgPath,
          new kakaoObj.maps.Size(32, 32),
          { offset: new kakaoObj.maps.Point(16, 32) }
        );
      } catch (error) {
        console.error('⚠️ 마커 이미지 생성 실패:', error);
        return null;
      }
    };
    
    // 마커 이미지 생성
    const defaultMarker = createMarkerImage('/assets/marker-default.svg');
    const selectedMarker = createMarkerImage('/assets/marker-selected.svg');
    const unselectedMarker = createMarkerImage('/assets/marker-unselected.svg');
    
    if (!defaultMarker || !selectedMarker || !unselectedMarker) {
      console.error('❌ 마커 이미지 생성 실패');
      return;
    }
    
    const mm = {};
    const newMarkers = validStores.map(store => {
      try {
        // 선택된 업체인지 확인하여 마커 이미지 결정
        const isSelected = selectedId === store.id;
        let markerImage;
        
        if (isSelected) {
          markerImage = selectedMarker;
        } else {
          // 선택되지 않은 마커는 약하게 표시
          markerImage = unselectedMarker;
        }
        
        const marker = new kakaoObj.maps.Marker({
          position: new kakaoObj.maps.LatLng(store.lat, store.lng),
          title: store.name,
          image: markerImage
        });
        
        console.log(`📍 마커 생성: ${store.name}`, {
          position: { lat: store.lat, lng: store.lng },
          isSelected,
          markerImage: markerImage ? '설정됨' : '설정되지 않음'
        });
        
        // 마커에 CSS 클래스 추가
        if (isSelected) {
          marker.setZIndex(1000); // 선택된 마커를 위에 표시
        } else {
          marker.setZIndex(100);
        }
        
        // 마커에 store 정보 저장
        marker.__store = store;
        
        marker.setMap(map);
        
        console.log(`📍 마커 지도에 추가 완료: ${store.name}`);
        
        // 마커 클릭 이벤트
        kakaoObj.maps.event.addListener(marker, 'click', (e) => {
          console.log('🎯 마커 클릭 이벤트 발생!');
          console.log('🎯 이벤트 객체:', e);
          console.log(`🎯 마커 클릭: ${store.name} (ID: ${store.id})`);
          
          // 기존 정보창 닫기
          if (currentInfo) {
            currentInfo.close();
            setCurrentInfo(null);
          }
          
          // 모든 마커를 unselected 상태로 리셋
          Object.values(mm).forEach(m => {
            if (m && m !== marker) {
              m.setImage(unselectedMarker);
              m.setZIndex(100);
              console.log(`📍 마커 리셋: ${m.__store?.name || 'unknown'}`);
            }
          });
          
          // 현재 마커를 선택된 이미지로 강조
          marker.setImage(selectedMarker);
          marker.setZIndex(1000); // 선택된 마커를 위에 표시
          setSelectedMarkerId(store.id);
          
          // 콜백 실행 (하단 리스트 앵커링)
          if (onMarkerClick && typeof onMarkerClick === 'function') {
            onMarkerClick(store);
            console.log('✅ onMarkerClick 콜백 실행 완료');
          } else {
            console.warn('⚠️ onMarkerClick 콜백이 함수가 아님:', onMarkerClick);
          }
          
          console.log(`📍 ${store.name} 마커 하이라이팅 완료`);
          console.log(`📍 현재 선택된 마커 ID: ${store.id}`);
          console.log(`📍 총 마커 수: ${Object.keys(mm).length}`);
        });
        
        mm[store.id] = marker;
        return marker;
      } catch (error) {
        console.error(`❌ 마커 생성 실패 (${store.name}):`, error);
        return null;
      }
    }).filter(Boolean); // null 값 제거
    
    // 선택 상태 업데이트 - 모든 마커를 먼저 unselected로 설정
    Object.values(mm).forEach(m => {
      m.setImage(unselectedMarker);
      m.setZIndex(100);
      console.log(`📍 마커 초기 상태 설정: ${m.__store.name}`);
    });
    
    // 선택된 마커가 있으면 해당 마커만 강조
    if (selectedId) {
      setSelectedMarkerId(selectedId);
      
      const selectedMarkerObj = mm[selectedId];
      if (selectedMarkerObj) {
        selectedMarkerObj.setImage(selectedMarker);
        selectedMarkerObj.setZIndex(1000);
        console.log(`📍 선택된 마커 강조: ${selectedMarkerObj.__store.name}`);
      }
    } else {
      setSelectedMarkerId(null);
    }
    
    setMarkers(newMarkers);
    setMarkerMap(mm);
    
    console.log(`📍 마커 업데이트 완료: ${newMarkers.length}개 마커 생성`);
    console.log('📍 생성된 마커들:', newMarkers);
    console.log('📍 마커 맵:', Object.keys(mm));
    console.log('📍 선택된 마커 하이라이팅 완료');
  };

  // 마커 강조 해제
  const clearMarkerHighlight = () => {
    if (!map || !kakaoObj) return;
    
    console.log('마커 강조 해제 시작');
    
    // SVG 마커 이미지 생성 (일반적인 카카오맵 마커 방식)
    const createMarkerImage = (svgPath) => {
      try {
        return new kakaoObj.maps.MarkerImage(
          svgPath,
          new kakaoObj.maps.Size(32, 32),
          { offset: new kakaoObj.maps.Point(16, 32) }
        );
      } catch (error) {
        console.error('⚠️ 마커 이미지 생성 실패:', error);
        return null;
      }
    };
    
    const unselectedMarker = createMarkerImage('/assets/marker-unselected.svg');
    
    if (!unselectedMarker) {
      console.error('❌ unselected 마커 이미지 생성 실패');
      return;
    }
    
    // markerMap 상태를 사용하여 마커 리셋
    if (markerMap && Object.keys(markerMap).length > 0) {
      Object.values(markerMap).forEach(marker => {
        if (marker && marker.setImage) {
          marker.setImage(unselectedMarker);
          marker.setZIndex(100); // Z-인덱스도 리셋
          console.log(`📍 마커 강조 해제: ${marker.__store?.name || 'unknown'}`);
        }
      });
      console.log(`마커 강조 해제 완료 - ${Object.keys(markerMap).length}개 마커를 unselected 마커로 표시`);
    } else {
      console.log('마커 강조 해제 완료 - 마커가 없음');
    }
    
    // 선택 상태 리셋
    setSelectedMarkerId(null);
  };

  // 현재 위치 가져오기 및 표시
  const getCurrentLocation = () => {
    if (!map || !kakaoObj) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = new kakaoObj.maps.LatLng(latitude, longitude);
          
          console.log('📍 현재 위치 획득:', { latitude, longitude });
          
          // 현재 위치 마커 생성 (SVG 사용)
          const createCurrentLocationMarker = () => {
            return new kakaoObj.maps.MarkerImage(
              '/assets/marker-current-location.svg',
              new kakaoObj.maps.Size(32, 32),
              { offset: new kakaoObj.maps.Point(16, 32) }
            );
          };
          
          // 새 현재 위치 마커 생성
          const newCurrentLocationMarker = new kakaoObj.maps.Marker({
            position: location,
            map: map,
            image: createCurrentLocationMarker(),
            zIndex: 1000
          });
          
          // 현재 위치 마커 클릭 이벤트 추가
          kakaoObj.maps.event.addListener(newCurrentLocationMarker, 'click', () => {
            console.log('📍 현재 위치 마커 클릭 - 1km 반경내 업체 필터링 시작');
            
            // 1km 반경내 업체만 필터링
            const nearbyStores = stores.filter(store => {
              const storeLocation = new kakaoObj.maps.LatLng(store.lat, store.lng);
              const distance = kakaoObj.maps.geometry.distance(location, storeLocation);
              return distance <= radius;
            });
            
            console.log(`📍 1km 반경내 업체: ${nearbyStores.length}개`);
            
            // 1km 반경내 업체만 필터링하여 마커 업데이트
            // 이 함수는 외부에서 호출되어야 하므로 콜백으로 처리
            if (window.onCurrentLocationClick) {
              window.onCurrentLocationClick(location, 1000);
            }
          });
          
          // 1km 반경 원 생성
          const newCurrentLocationCircle = new kakaoObj.maps.Circle({
            center: location,
            radius: 1000, // 1km로 증가
            strokeWeight: 2,
            strokeColor: '#3B82F6',
            strokeOpacity: 0.8,
            strokeStyle: 'dashed',
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            map: map,
            zIndex: 999
          });
          
          // 현재 위치 텍스트 라벨 추가
          const currentLocationLabel = new kakaoObj.maps.InfoWindow({
            content: '<div style="padding: 5px; background: #3B82F6; color: white; border-radius: 4px; font-size: 12px; font-weight: bold;">내 위치</div>',
            position: location,
            zIndex: 1001
          });
          
          // 라벨을 마커 위에 표시
          currentLocationLabel.open(map, newCurrentLocationMarker);
          
          // 지도 중심을 현재 위치로 이동 (첫 로드 시에만)
          if (!map.getCenter().equals(location)) {
            map.setCenter(location);
            map.setLevel(4);
          }
        },
        (error) => {
          console.warn('⚠️ 위치 정보를 가져올 수 없습니다:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      console.warn('⚠️ 이 브라우저는 위치 정보를 지원하지 않습니다');
    }
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
    clearMarkerHighlight,
    getCurrentLocation
  };
};
