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

export default function useKakaoMap(mode) {
  console.log('🔄 useKakaoMap 훅 실행, mode:', mode);
  
  const [kakaoObj, setKakaoObj] = useState(null);
  const [map, setMap] = useState(null);
  const [markerMap, setMarkerMap] = useState({});
  const [currentInfo, setCurrentInfo] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const mapRef = useRef(null);

  // mode 변경 감지
  useEffect(() => {
    console.log('🔄 mode 변경 감지:', mode);
  }, [mode]);

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
            
            // Directions 서비스 확인 (현재 사용하지 않음)
            if (window.kakao.maps.services.Directions) {
              console.log('✅ Directions 서비스 사용 가능');
            } else {
              // Directions 서비스는 현재 사용하지 않으므로 경고 제거
              console.log('ℹ️ Directions 서비스는 현재 사용하지 않음');
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
    
    // 지도가 이미 있으면 초기화 건너뜀 (완전히 새로운 접근)
    if (map) {
      console.log('✅ 이미 지도가 존재함 - 초기화 건너뜀');
      return;
    }
    
    // 지도 초기화 함수 정의 (함수 호이스팅을 위해 먼저 정의)
    const initializeNewMap = () => {
      console.log('✅ 지도 초기화 조건 충족, 지도 생성 시작...');
      console.log('📍 mapRef 요소:', mapRef.current);
      console.log('📍 mapRef 크기:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
      
      // DOM 요소가 준비되지 않았으면 재시도
      if (!mapRef.current || mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
        console.warn('⚠️ DOM 요소가 준비되지 않음, 100ms 후 재시도');
        setTimeout(() => {
          initializeNewMap();
        }, 100);
        return;
      }
      
      try {
        // 현재 위치를 중심으로 설정 (실패 시 성남시 중심으로 대체)
        const defaultCenter = new kakaoObj.maps.LatLng(37.4201, 127.1267); // 성남시 중심 (더 정확한 좌표)
        let center = defaultCenter;
        
        // 현재 위치를 먼저 시도
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              center = new kakaoObj.maps.LatLng(latitude, longitude);
              console.log('📍 현재 위치로 지도 중심 설정:', { latitude, longitude });
              initializeMapWithCenter(center);
            },
            (error) => {
              console.warn('⚠️ 위치 정보를 가져올 수 없어 기본 위치로 설정:', error.message);
              initializeMapWithCenter(defaultCenter);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000, // 5초 타임아웃
              maximumAge: 300000 // 5분 캐시
            }
          );
        } else {
          console.log('📍 위치 서비스 미지원, 기본 위치로 설정');
          initializeMapWithCenter(defaultCenter);
        }
        
        function initializeMapWithCenter(mapCenter) {
          try {
            console.log('📍 지도 중심 좌표 설정:', mapCenter);
          
            const mapOptions = { 
              center: mapCenter, 
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
              searchControl: false, // 검색 컨트롤 비활성화
              // 모바일 터치 최적화
              draggable: true,
              scrollwheel: true,
              disableDoubleClick: false,
              disableDoubleTap: false
            };
            
            console.log('🗺️ 지도 옵션 설정 완료:', mapOptions);
            
            // 지도 생성 전 DOM 요소 최종 확인
            if (!mapRef.current) {
              console.error('❌ 지도 생성 실패: mapRef.current가 없음');
              return;
            }
            
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
            
            // 지도 이동/줌 시 검색 버튼 표시 (수동 업데이트)
            kakaoObj.maps.event.addListener(newMap, 'dragend', () => {
              console.log('📍 지도 드래그 완료 - 검색 버튼 표시');
              setShowSearchButton(true);
            });
            
            kakaoObj.maps.event.addListener(newMap, 'zoom_changed', () => {
              console.log('🔍 지도 줌 레벨 변경:', newMap.getLevel());
              setShowSearchButton(true);
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
        }
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
    };
    
    // 새 지도 초기화 실행
    initializeNewMap();
  }, [kakaoObj, mode]);

  // 마커 이미지 생성 함수
  const createMarkerImage = (imagePath, size = 32) => {
    try {
      return new kakaoObj.maps.MarkerImage(
        imagePath,
        new kakaoObj.maps.Size(size, size),
        { offset: new kakaoObj.maps.Point(size/2, size) }
      );
    } catch (error) {
      console.error('⚠️ 마커 이미지 생성 실패:', error);
      return null;
    }
  };

  // 마커 관리 (성능 최적화) - 단일 선택 상태 관리
  const updateMarkers = (stores, onMarkerClick, showInfoWindow = false, selectedId = null, category = 'all') => {
    if (!map || !kakaoObj) {
      console.warn('⚠️ 마커 업데이트 실패: map 또는 kakaoObj가 없음');
      return;
    }
    
    // 중복 업데이트 방지 (동일한 stores와 selectedId면 스킵)
    const currentKey = `${stores.length}-${selectedId}-${category}`;
    if (window.lastMarkerUpdateKey === currentKey) {
      console.log('📍 중복 마커 업데이트 방지:', currentKey);
      return;
    }
    window.lastMarkerUpdateKey = currentKey;
    
    if (!stores || !Array.isArray(stores) || stores.length === 0) {
      console.warn('⚠️ 마커 업데이트 실패: 유효하지 않은 stores 데이터');
      // 기존 마커 제거
      Object.values(markerMap).forEach(mk => {
        if (mk && mk.setMap) {
          mk.setMap(null);
          // 클릭 영역 오버레이도 제거
          if (mk.__clickAreaOverlay && mk.__clickAreaOverlay.setMap) {
            mk.__clickAreaOverlay.setMap(null);
          }
        }
      });
      setMarkerMap({});
      setSelectedMarkerId(null);
      return;
    }
    
    console.log(`📍 마커 업데이트: ${stores.length}개 업체, 선택된 ID: ${selectedId}, 카테고리: ${category}`);
    
    // 현재 stores 정보를 전역 변수에 저장 (지도 이동 시 마커 업데이트용)
    window.currentStores = stores;
    window.currentOnMarkerClick = onMarkerClick;
    window.currentCategory = category;
    
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
    
    // 뷰포트 내 마커만 생성 (전역 함수 사용)
    const storesToRender = getVisibleStores(validStores);
    
    if (storesToRender.length === 0) {
      console.warn('⚠️ 뷰포트 내에 표시할 업체가 없음');
      Object.values(markerMap).forEach(mk => {
        if (mk && mk.setMap) {
          // 이벤트 리스너 제거
          kakaoObj.maps.event.removeListener(mk, 'click');
          kakaoObj.maps.event.removeListener(mk, 'mousedown');
          kakaoObj.maps.event.removeListener(mk, 'mouseup');
          kakaoObj.maps.event.removeListener(mk, 'touchstart');
          // 마커 제거
          mk.setMap(null);
        }
      });
      setMarkerMap({});
      setSelectedMarkerId(null);
      return;
    }
    
    // 기존 마커 제거 (이벤트 리스너도 함께 제거)
    Object.values(markerMap).forEach(mk => {
      if (mk && mk.setMap) {
        // 이벤트 리스너 제거
        kakaoObj.maps.event.removeListener(mk, 'click');
        kakaoObj.maps.event.removeListener(mk, 'mousedown');
        kakaoObj.maps.event.removeListener(mk, 'mouseup');
        kakaoObj.maps.event.removeListener(mk, 'touchstart');
        // 마커 제거
        mk.setMap(null);
      }
    });
    
    // 마커 이미지 생성 - 원래 크기로 복원
    const unselectedMarker = createMarkerImage('/assets/marker-unselected.svg', 32); // 50 → 32 (원래 크기)
    const selectedMarker = createMarkerImage('/assets/marker-selected.svg', 38); // 60 → 38 (원래 크기)
    
    if (!unselectedMarker || !selectedMarker) {
      console.error('❌ 마커 이미지 생성 실패');
      return;
    }
    
    const mm = {};
    storesToRender.forEach(store => {
      try {
        const isSelected = selectedId === store.id;
        const markerImage = isSelected ? selectedMarker : unselectedMarker;
        
        const marker = new kakaoObj.maps.Marker({
          position: new kakaoObj.maps.LatLng(store.lat, store.lng),
          title: store.name,
          image: markerImage,
          zIndex: isSelected ? 1000 : 100,
          clickable: true // 클릭 가능하도록 명시적 설정
        });
        
        // 마커에 store 정보 저장
        marker.__store = store;
        marker.setMap(map);
        
        // 마커 클릭 이벤트 - 단일 선택만 허용
        const handleMarkerClick = (e) => {
          // 이벤트 전파 방지 (PC와 모바일 모두)
          if (e && e.stopPropagation) {
            e.stopPropagation();
          }
          
          // PC 환경에서 기본 동작 방지
          if (e && e.preventDefault) {
            e.preventDefault();
          }
          
          console.log(`🎯 마커 클릭 감지: ${store.name} (ID: ${store.id})`);
          console.log(`🎯 현재 선택된 마커 ID: ${selectedMarkerId}`);
          console.log(`🎯 이벤트 타입: ${e?.type || 'unknown'}`);
          
          // 이미 선택된 마커를 다시 클릭한 경우 무시
          if (selectedMarkerId === store.id) {
            console.log('📍 이미 선택된 마커 - 무시');
            return;
          }
          
          console.log(`📍 새로운 마커 선택: ${store.name}`);
          
          // 기존 정보창 닫기
          if (currentInfo) {
            currentInfo.close();
            setCurrentInfo(null);
          }
          
          // 먼저 상태 업데이트 (중복 방지)
          setSelectedMarkerId(store.id);
          
          // 모든 기존 마커를 unselected 상태로 리셋 (현재 생성 중인 mm 사용)
          Object.values(mm).forEach(m => {
            if (m && m !== marker && m.setImage) {
              m.setImage(unselectedMarker);
              m.setZIndex(100);
            }
          });
          
          // 현재 마커를 선택된 상태로 강조
          marker.setImage(selectedMarker);
          marker.setZIndex(1000);
          
          console.log(`✅ 마커 하이라이팅 완료: ${store.name}`);
          
          // 콜백 실행
          if (onMarkerClick && typeof onMarkerClick === 'function') {
            onMarkerClick(store);
          }
        };
        
        // 마커에 클릭 이벤트 추가 (PC와 모바일 모두 지원)
        kakaoObj.maps.event.addListener(marker, 'click', handleMarkerClick);
        
        // PC 환경에서 마우스 이벤트 추가 지원
        kakaoObj.maps.event.addListener(marker, 'mousedown', (e) => {
          console.log(`🖱️ 마우스 다운 감지: ${store.name}`);
          if (e && e.stopPropagation) {
            e.stopPropagation();
          }
        });
        
        kakaoObj.maps.event.addListener(marker, 'mouseup', (e) => {
          console.log(`🖱️ 마우스 업 감지: ${store.name}`);
          if (e && e.stopPropagation) {
            e.stopPropagation();
          }
        });
        
        mm[store.id] = marker;
      } catch (error) {
        console.error(`❌ 마커 생성 실패 (${store.name}):`, error);
      }
    });
    
    setMarkerMap(mm);
    setSelectedMarkerId(selectedId);
    
    console.log(`✅ 마커 업데이트 완료: ${Object.keys(mm).length}개 마커 생성 (전체 ${stores.length}개 중 뷰포트 내 마커만)`);
  };

  // 마커 강조 해제
  const clearMarkerHighlight = () => {
    if (!map || !kakaoObj) return;
    
    console.log('📍 마커 강조 해제 시작');
    
    const unselectedMarker = createMarkerImage('/assets/marker-unselected.svg', 32);
    
    if (!unselectedMarker) {
      console.error('❌ unselected 마커 이미지 생성 실패');
      return;
    }
    
    // markerMap 상태를 사용하여 마커 리셋
    if (markerMap && Object.keys(markerMap).length > 0) {
      Object.values(markerMap).forEach(marker => {
        if (marker && marker.setImage) {
          marker.setImage(unselectedMarker);
          marker.setZIndex(100);
        }
      });
      console.log(`📍 마커 강조 해제 완료 - ${Object.keys(markerMap).length}개 마커 리셋`);
    }
    
    setSelectedMarkerId(null);
  };

  // 지도 상태 초기화 (지역 변경 시 호출)
  const resetMapState = () => {
    if (!map || !kakaoObj) return;
    
    console.log('🔄 지도 상태 초기화 시작');
    
    // 기존 마커들 정리
    Object.values(markerMap).forEach(mk => {
      if (mk && mk.setMap) {
        mk.setMap(null);
        // 클릭 영역 오버레이도 제거
        if (mk.__clickAreaOverlay && mk.__clickAreaOverlay.setMap) {
          mk.__clickAreaOverlay.setMap(null);
        }
      }
    });
    setMarkerMap({});
    
    // 현재 위치 마커 정리 (원과 라벨은 비활성화됨)
    if (window.currentLocationMarker && window.currentLocationMarker.setMap) {
      window.currentLocationMarker.setMap(null);
      window.currentLocationMarker = null;
    }
    // if (window.currentLocationCircle && window.currentLocationCircle.setMap) {
    //   window.currentLocationCircle.setMap(null);
    //   window.currentLocationCircle = null;
    // }
    
    // 선택된 마커 초기화
    setSelectedMarkerId(null);
    
    // 지도 중심을 기본 위치로 이동
    const defaultCenter = new kakaoObj.maps.LatLng(37.4201, 127.1267);
    map.setCenter(defaultCenter);
    map.setLevel(8);
    
    console.log('✅ 지도 상태 초기화 완료');
  };

  // 현재 위치 가져오기 및 표시
  const getCurrentLocation = () => {
    if (!map || !kakaoObj) return;
    
    // 이미 현재 위치가 표시되어 있으면 중복 실행 방지
    if (window.currentLocationMarker) {
      console.log('📍 현재 위치가 이미 표시됨 - 중복 실행 방지');
      return;
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = new kakaoObj.maps.LatLng(latitude, longitude);
          
          console.log('📍 현재 위치 획득:', { latitude, longitude });
          
          // 현재 위치 마커 생성
          const currentLocationMarker = createMarkerImage('/assets/marker-current-location.svg', 32);
          
          if (currentLocationMarker) {
            const newCurrentLocationMarker = new kakaoObj.maps.Marker({
              position: location,
              map: map,
              image: currentLocationMarker,
              zIndex: 1000
            });
            
            // 현재 위치 원 생성 비활성화 (DOM 조작 오류 방지)
            // let newCurrentLocationCircle = null;
            // try {
            //   newCurrentLocationCircle = new kakaoObj.maps.Circle({
            //     center: location,
            //     radius: 1000,
            //     strokeWeight: 2,
            //     strokeColor: '#3B82F6',
            //     strokeOpacity: 0.8,
            //     strokeStyle: 'dashed',
            //     fillColor: '#3B82F6',
            //     fillOpacity: 0.1,
            //     map: map,
            //     zIndex: 999
            //   });
            // } catch (error) {
            //   console.error('❌ 현재 위치 원 생성 실패:', error);
            // }
            
            // 현재 위치 텍스트 라벨 비활성화 (DOM 조작 오류 방지)
            // const currentLocationLabel = new kakaoObj.maps.InfoWindow({
            //   content: '<div style="padding: 5px; background: #3B82F6; color: white; border-radius: 4px; font-size: 12px; font-weight: bold;">내 위치</div>',
            //   position: location,
            //   zIndex: 1001
            // });
            
            // currentLocationLabel.open(map, newCurrentLocationMarker);
            
            // 전역 변수에 저장 (마커만)
            window.currentLocationMarker = newCurrentLocationMarker;
            
            // 지도 중심은 이미 초기화 시 설정되었으므로 여기서는 마커만 추가
            console.log('📍 현재 위치 마커 추가 완료');
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

  // 뷰포트 기반 마커 필터링 함수 (전역 접근 가능)
  const getVisibleStores = (stores) => {
    if (!map || !kakaoObj || !stores || stores.length === 0) {
      return [];
    }
    
    try {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest(); // 남서쪽 좌표
      const ne = bounds.getNorthEast(); // 북동쪽 좌표
      
      // 뷰포트 키 생성 (캐싱용) - 더 정밀하게
      const viewportKey = `${sw.getLat().toFixed(6)}-${sw.getLng().toFixed(6)}-${ne.getLat().toFixed(6)}-${ne.getLng().toFixed(6)}`;
      
      // 동일한 뷰포트면 캐시된 결과 사용 (하지만 더 엄격하게)
      if (window.lastViewportKey === viewportKey && window.lastVisibleStores && window.lastStoresLength === stores.length) {
        console.log(`📍 뷰포트 캐시 사용: ${stores.length}개 → ${window.lastVisibleStores.length}개 마커 생성`);
        return window.lastVisibleStores;
      }
      
      const visibleStores = stores.filter(store => {
        const lat = store.lat;
        const lng = store.lng;
        
        // 지도 뷰포트 내에 있는지 확인
        return lat >= sw.getLat() && lat <= ne.getLat() && 
               lng >= sw.getLng() && lng <= ne.getLng();
      });
      
      // 캐시 저장 (stores 길이도 함께 저장)
      window.lastViewportKey = viewportKey;
      window.lastVisibleStores = visibleStores;
      window.lastStoresLength = stores.length;
      
      console.log(`📍 뷰포트 필터링: ${stores.length}개 → ${visibleStores.length}개 마커 생성`);
      return visibleStores;
    } catch (error) {
      console.warn('⚠️ 뷰포트 필터링 실패, 전체 마커 생성:', error);
      return stores; // 필터링 실패 시 전체 마커 생성
    }
  };

  // 현재 뷰포트에 표시된 업체 반환
  const getVisibleStoresForList = () => {
    if (!map || !kakaoObj || !window.currentStores || window.currentStores.length === 0) {
      return [];
    }
    
    try {
      return getVisibleStores(window.currentStores);
    } catch (error) {
      console.warn('⚠️ 뷰포트 필터링 실패, 전체 업체 반환:', error);
      return window.currentStores;
    }
  };

  // 현재 지도 중심 좌표 기준으로 지역명 반환
  const getCurrentLocationName = () => {
    if (!map || !kakaoObj) {
      return '지역 정보 없음';
    }
    
    try {
      const center = map.getCenter();
      const lat = center.getLat();
      const lng = center.getLng();
      
      // 간단한 지역명 매핑 (시/군 단위까지만 표시)
      // 경기도 주요 지역 좌표 범위로 간단히 매핑
      if (lat >= 37.2 && lat <= 37.8 && lng >= 126.5 && lng <= 127.5) {
        // 성남시
        if (lat >= 37.4 && lat <= 37.5 && lng >= 127.0 && lng <= 127.2) {
          return '성남시';
        }
        // 수원시
        if (lat >= 37.25 && lat <= 37.35 && lng >= 126.9 && lng <= 127.1) {
          return '수원시';
        }
        // 안양시
        if (lat >= 37.35 && lat <= 37.45 && lng >= 126.8 && lng <= 127.0) {
          return '안양시';
        }
        // 의정부시
        if (lat >= 37.7 && lat <= 37.8 && lng >= 127.0 && lng <= 127.2) {
          return '의정부시';
        }
        // 고양시
        if (lat >= 37.6 && lat <= 37.7 && lng >= 126.7 && lng <= 126.9) {
          return '고양시';
        }
        // 용인시
        if (lat >= 37.2 && lat <= 37.3 && lng >= 127.1 && lng <= 127.3) {
          return '용인시';
        }
        // 안산시
        if (lat >= 37.3 && lat <= 37.4 && lng >= 126.7 && lng <= 126.9) {
          return '안산시';
        }
        // 부천시
        if (lat >= 37.5 && lat <= 37.6 && lng >= 126.7 && lng <= 126.9) {
          return '부천시';
        }
        // 광명시
        if (lat >= 37.4 && lat <= 37.5 && lng >= 126.8 && lng <= 127.0) {
          return '광명시';
        }
        // 평택시
        if (lat >= 36.9 && lat <= 37.1 && lng >= 127.0 && lng <= 127.2) {
          return '평택시';
        }
        // 시흥시
        if (lat >= 37.3 && lat <= 37.4 && lng >= 126.8 && lng <= 127.0) {
          return '시흥시';
        }
        // 김포시
        if (lat >= 37.6 && lat <= 37.7 && lng >= 126.6 && lng <= 126.8) {
          return '김포시';
        }
        // 하남시
        if (lat >= 37.5 && lat <= 37.6 && lng >= 127.2 && lng <= 127.4) {
          return '하남시';
        }
        // 오산시
        if (lat >= 37.1 && lat <= 37.2 && lng >= 127.0 && lng <= 127.2) {
          return '오산시';
        }
        // 의왕시
        if (lat >= 37.3 && lat <= 37.4 && lng >= 126.9 && lng <= 127.1) {
          return '의왕시';
        }
        // 이천시
        if (lat >= 37.2 && lat <= 37.3 && lng >= 127.4 && lng <= 127.6) {
          return '이천시';
        }
        // 안성시
        if (lat >= 37.0 && lat <= 37.1 && lng >= 127.2 && lng <= 127.4) {
          return '안성시';
        }
        // 여주시
        if (lat >= 37.3 && lat <= 37.4 && lng >= 127.6 && lng <= 127.8) {
          return '여주시';
        }
        // 양평군
        if (lat >= 37.4 && lat <= 37.6 && lng >= 127.4 && lng <= 127.6) {
          return '양평군';
        }
        // 연천군
        if (lat >= 38.0 && lat <= 38.2 && lng >= 127.0 && lng <= 127.2) {
          return '연천군';
        }
        // 가평군
        if (lat >= 37.8 && lat <= 38.0 && lng >= 127.4 && lng <= 127.6) {
          return '가평군';
        }
        // 포천시
        if (lat >= 37.8 && lat <= 37.9 && lng >= 127.2 && lng <= 127.4) {
          return '포천시';
        }
        // 남양주시
        if (lat >= 37.6 && lat <= 37.7 && lng >= 127.2 && lng <= 127.4) {
          return '남양주시';
        }
        // 구리시
        if (lat >= 37.6 && lat <= 37.7 && lng >= 127.1 && lng <= 127.3) {
          return '구리시';
        }
        // 기타 경기도 지역 (시/군 단위로 표시하지 않고 기본값 반환)
        return '경기도';
      }
      
      return '알 수 없는 지역';
    } catch (error) {
      console.warn('⚠️ 지역명 조회 실패:', error);
      return '지역 정보 없음';
    }
  };

  // 수동 마커 업데이트 함수 (검색 버튼 클릭 시)
  const manualMarkerUpdate = (onListUpdate) => {
    console.log('🔍 수동 마커 업데이트 시작');
    console.log('🔍 map:', !!map);
    console.log('🔍 kakaoObj:', !!kakaoObj);
    console.log('🔍 window.currentStores:', window.currentStores?.length || 0);
    console.log('🔍 window.currentOnMarkerClick:', !!window.currentOnMarkerClick);
    console.log('🔍 window.currentCategory:', window.currentCategory);
    console.log('🔍 selectedMarkerId:', selectedMarkerId);
    
    if (!map || !kakaoObj || !window.currentStores || window.currentStores.length === 0) {
      console.warn('⚠️ 수동 마커 업데이트 실패: 필요한 데이터가 없음');
      return;
    }
    
    console.log('📍 수동 마커 업데이트 실행');
    // 캐시 초기화 후 업데이트
    window.lastViewportKey = null;
    window.lastVisibleStores = null;
    window.lastMarkerUpdateKey = null; // 중복 방지 키도 초기화
    
    // 뷰포트가 변경되었으므로 이전 선택된 마커는 초기화
    const newSelectedId = null;
    updateMarkers(window.currentStores, window.currentOnMarkerClick, false, newSelectedId, window.currentCategory);
    setShowSearchButton(false); // 검색 버튼 숨기기
    
    // 리스트 업데이트 콜백 호출 (finalShown 재계산을 위해)
    if (onListUpdate && typeof onListUpdate === 'function') {
      onListUpdate();
    }
    
    // 지역명 업데이트를 위한 추가 콜백 (지도 중심 변경 감지)
    setTimeout(() => {
      if (onListUpdate && typeof onListUpdate === 'function') {
        onListUpdate();
      }
    }, 1000);
  };

  return {
    kakaoObj,
    map,
    mapRef,
    markers: Object.values(markerMap), // markerMap에서 배열 추출
    markerMap,
    currentInfo,
    selectedMarkerId,
    setSelectedMarkerId,
    updateMarkers,
    clearMarkerHighlight,
    resetMapState,
    getCurrentLocation,
    showSearchButton,
    manualMarkerUpdate,
    getVisibleStores,
    getVisibleStoresForList,
    getCurrentLocationName
  };
};
