import { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import RegionGrid from './components/RegionGrid';
import BottomList from './components/BottomList';
import StoreCard from './components/StoreCard';
import RouteModal from './components/RouteModal';
import SplashScreen from './components/SplashScreen';
import CoupangBanner from './components/CoupangBanner';
import PlaceDetailView from './components/PlaceDetailView';
import { buildKakaoDirectionsUrl, getUserLocOrFallback, uiModeToApi } from './utils/directionsLink';
import useKakaoMap from './hooks/useKakaoMap';
import { useStores } from './hooks/useStores';
import './App.css';

export default function App() {
  // 기본 상태
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState('region');
  const [selectedCity, setSelectedCity] = useState('');
  const [category, setCategory] = useState('all');
  const [searchName, setSearchName] = useState('');
  const [listUpdateTrigger, setListUpdateTrigger] = useState(0);
  const [myPos, setMyPos] = useState(null);
  const [circle, setCircle] = useState(null);
  const [isNearbyEnabled, setIsNearbyEnabled] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isBottomListExpanded, setIsBottomListExpanded] = useState(true);
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  const [detailStore, setDetailStore] = useState(null);
  
  // 새로운 상태들
  const [currentMapCenter, setCurrentMapCenter] = useState(null);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routePreview, setRoutePreview] = useState(null); // 경로 미리보기 정보
  const [showTimeDisplay, setShowTimeDisplay] = useState(false); // 소요시간 표시 여부
  
  // 이동수단 선택 상태
  const [transitMode, setTransitMode] = useState('자차');
  
  // PC 환경 감지
  const [isPC, setIsPC] = useState(false);
  
  // Feature flags for region pickers (can be toggled via env or prop)
  const enableGyeonggiPicker = false; // 기존 그리드 스타일
  const enableNaverStylePicker = false; // 네이버 스타일 지도 기반 비활성화
  const enableNaverStyleTest = false; // 네이버 스타일 테스트 페이지
  const enableDebugTopo = false; // TopoJSON 디버그 페이지 비활성화 (서비스 모드)
  
  const headerRef = useRef(null);
  const radius = 1000; // 1km로 수정

  // PC 환경 감지
  useEffect(() => {
    const checkIsPC = () => {
      setIsPC(window.innerWidth >= 768);
    };
    
    checkIsPC();
    window.addEventListener('resize', checkIsPC);
    
    return () => {
      window.removeEventListener('resize', checkIsPC);
    };
  }, []);

  // 서비스 모드: 디버그 라우팅 비활성화

  // 커스텀 훅 사용
  const { stores, loading, loadStoresByCity } = useStores();
  const { kakaoObj, map, mapRef, markers, markerMap, updateMarkers, clearMarkerHighlight, selectedMarkerId, setSelectedMarkerId, showSearchButton, manualMarkerUpdate, getVisibleStoresForList, getCurrentLocationName, getCurrentLocation, resetMapState } = useKakaoMap(mode);

  // mode 변경 감지 및 디버깅
  useEffect(() => {
    console.log('🏙️ App.jsx에서 mode 변경 감지:', mode);
    console.log('🏙️ kakaoObj 상태:', !!kakaoObj);
    console.log('🏙️ map 상태:', !!map);
    
    // DOM 렌더링 상태 확인
    setTimeout(() => {
      const frameElement = document.querySelector('.frame');
      console.log('🏙️ DOM 렌더링 상태 확인:');
      console.log('- frame 요소:', !!frameElement);
      console.log('- frame 클래스:', frameElement?.className);
      console.log('- body 직계 자식:', Array.from(document.body.children).map(child => ({
        tagName: child.tagName,
        className: child.className,
        id: child.id
      })));
    }, 100);
    
    // mode가 map으로 변경되었는데 map이 없으면 강제로 useKakaoMap 재실행
    if (mode === 'map' && !map && kakaoObj) {
      console.log('🏙️ mode가 map인데 map이 없음 - useKakaoMap 재실행 필요');
    }
  }, [mode, kakaoObj, map]);

  // 마커에 길찾기 기능 설정
  useEffect(() => {
    if (markers && markers.length > 0 && kakaoObj) {
      // 각 마커에 목적지 정보 추가
      markers.forEach(marker => {
        const store = marker.__store;
        if (store) {
          marker.__to = {
            name: store.name,
            lat: store.lat,
            lng: store.lng,
            placeId: store.placeId // placeId가 있다면 사용
          };
        }
      });
    }
  }, [markers, kakaoObj]);

  // 검색 필터링 (학원 카테고리 포함)
  const filteredStores = useMemo(() => {
    if (!searchName) {
      return stores;
    }
    const query = searchName.trim();
    return stores.filter(s => s.name && s.name.includes(query));
  }, [searchName, stores]);

  // 현재 위치 마커 클릭 시 1km 반경내 업체 필터링 (단순화)
  useEffect(() => {
    window.onCurrentLocationClick = (location, radius) => {
      console.log('📍 현재 위치 마커 클릭 - 1km 반경내 업체 필터링 시작');
      
      if (!kakaoObj || !map || !stores || stores.length === 0) {
        console.warn('⚠️ 필터링을 위한 데이터가 준비되지 않았습니다');
        return;
      }
      
      // 1km 반경내 업체만 필터링
      const nearbyStores = stores.filter(store => {
        const storeLocation = new kakaoObj.maps.LatLng(store.lat, store.lng);
        const distance = kakaoObj.maps.geometry.distance(location, storeLocation);
        return distance <= radius;
      });
      
      console.log(`📍 1km 반경내 업체: ${nearbyStores.length}개`);
      
      // 마커 업데이트 (필터링된 업체로)
      if (updateMarkers) {
        updateMarkers(nearbyStores, (store) => {
          setSelectedMarkerId(store.id);
          // 하단 리스트에서 해당 업체로 즉시 스크롤
          const el = document.querySelector(`[data-card-id="${CSS.escape(store.id)}"]`);
          if (el) {
            el.scrollIntoView({behavior:'auto',inline:'center',block:'nearest'});
          }
        }, false, null, category);
      }
      
      // 지도 중심을 현재 위치로 이동
      map.setCenter(location);
      map.setLevel(4);
      
      console.log('✅ 현재 위치 기반 필터링 완료');
    };
    
    return () => {
      delete window.onCurrentLocationClick;
    };
  }, [kakaoObj, map, stores, updateMarkers]);

  // 카테고리 필터링 (학원 카테고리 포함)
  const finalShown = useMemo(() => {
    let result = filteredStores;
    
    console.log('finalShown 계산:', {
      filteredCount: filteredStores.length,
      isNearbyEnabled,
      hasMyPos: !!myPos,
      hasCircle: !!circle,
      category,
      searchName: searchName.trim()
    });
    
    // 내 주변 필터링 제거 - 이제 지도에 내 위치만 표시

    // 카테고리 필터링 적용 (학원 카테고리 포함)
    if (category !== 'all') {
      const beforeFilter = result.length;
      result = result.filter(s => s.category === category);
      console.log(`카테고리 필터링 결과: ${beforeFilter}개 → ${result.length}개`);
    }

    // 검색 중이 아닐 때는 항상 뷰포트 필터링 적용 (지도 마커와 동기화)
    if (!searchName.trim() && map && kakaoObj) {
      const visibleStores = getVisibleStoresForList();
      if (visibleStores.length > 0) {
        const beforeViewport = result.length;
        result = result.filter(store => 
          visibleStores.some(visibleStore => visibleStore.id === store.id)
        );
        console.log('📍 뷰포트 필터링 적용 (지도 마커와 동기화):', {
          전체업체: filteredStores.length,
          뷰포트업체: visibleStores.length,
          카테고리필터후: beforeViewport,
          최종업체: result.length
        });
      }
    }

    console.log('최종 결과:', result.length);
    return result;
  }, [filteredStores, category, searchName, map, kakaoObj, getVisibleStoresForList, listUpdateTrigger]);

  // finalShown이 변경될 때마다 마커 업데이트 (단일 상태 관리)
  useEffect(() => {
    if (map && kakaoObj && finalShown && finalShown.length > 0) {
      console.log('🔄 finalShown 변경으로 마커 업데이트:', finalShown.length);
      updateMarkers(finalShown, (selectedStore) => {
        // 마커 클릭 시 하단 리스트에서 해당 업체로 즉시 스크롤
        const el = document.querySelector(`[data-card-id="${CSS.escape(selectedStore.id)}"]`);
        if (el) {
          el.scrollIntoView({behavior:'auto',inline:'center',block:'nearest'});
        }
      }, false, selectedMarkerId, category);
    } else if (map && kakaoObj && (!finalShown || finalShown.length === 0)) {
      console.log('🔄 업체가 없어서 마커 강조 해제');
      clearMarkerHighlight();
    }
  }, [finalShown, map, kakaoObj, updateMarkers, clearMarkerHighlight, selectedMarkerId]);

  // 지도 중심 변경 시 지역명 업데이트
  useEffect(() => {
    if (map && kakaoObj && mode === 'map') {
      const updateLocationName = () => {
        const currentLocationName = getCurrentLocationName();
        if (currentLocationName !== selectedCity) {
          console.log('📍 지역명 업데이트:', selectedCity, '→', currentLocationName);
          setSelectedCity(currentLocationName);
        }
      };

      // 지도 이동 완료 시 지역명 업데이트
      kakaoObj.maps.event.addListener(map, 'dragend', () => {
        setTimeout(updateLocationName, 500); // 지도 이동 완료 후 약간의 지연
      });

      // 줌 변경 시 지역명 업데이트
      kakaoObj.maps.event.addListener(map, 'zoom_changed', () => {
        setTimeout(updateLocationName, 500);
      });

      // 초기 지역명 설정
      updateLocationName();

      // 클린업 함수
      return () => {
        kakaoObj.maps.event.removeListener(map, 'dragend');
        kakaoObj.maps.event.removeListener(map, 'zoom_changed');
      };
    }
  }, [map, kakaoObj, mode, getCurrentLocationName, selectedCity]);

  // 지도 이동 감지 및 재검색 버튼 표시
  useEffect(() => {
    if (!map || !kakaoObj) return;

    const handleMapMove = () => {
      const center = map.getCenter();
      const currentLat = center.getLat();
      const currentLng = center.getLng();
      
      // 이전 중심점과 비교하여 이동 감지
      if (currentMapCenter) {
        const latDiff = Math.abs(currentLat - currentMapCenter.lat);
        const lngDiff = Math.abs(currentLng - currentMapCenter.lng);
        
        // 일정 거리 이상 이동했을 때만 재검색 버튼 표시
        if (latDiff > 0.001 || lngDiff > 0.001) {
          // 재검색 기능 제거됨
        }
      }
      
      setCurrentMapCenter({ lat: currentLat, lng: currentLng });
    };

    // 지도 이벤트 리스너 등록
    kakaoObj.maps.event.addListener(map, 'dragend', handleMapMove);
    kakaoObj.maps.event.addListener(map, 'zoom_changed', handleMapMove);

    return () => {
      kakaoObj.maps.event.removeListener(map, 'dragend', handleMapMove);
      kakaoObj.maps.event.removeListener(map, 'zoom_changed', handleMapMove);
    };
  }, [map, kakaoObj, currentMapCenter]);



  // 도시 선택
  const enterCity = async (city) => {
    console.log('🏙️ 도시 선택 시작:', city);
    console.log('🏙️ 현재 mode:', mode);
    
    setSelectedCity(city);
    setMode('map');
    console.log('🏙️ mode를 map으로 변경');
    
    setCategory('all');
    setSelectedMarkerId(null);
    
    // 지도 상태 초기화 (새 지역 선택 시)
    if (resetMapState) {
      console.log('🔄 지도 상태 초기화 시작');
      resetMapState();
      console.log('✅ 지도 상태 초기화 완료');
    }
    
    // 지도가 제대로 초기화되었는지 확인 및 강제 리렌더링
    setTimeout(() => {
      if (map && kakaoObj) {
        console.log('🗺️ 지도 초기화 확인:', {
          mapExists: !!map,
          kakaoObjExists: !!kakaoObj,
          mapCenter: map.getCenter(),
          mapLevel: map.getLevel()
        });
        
        // 지도 강제 리렌더링 (하얀 화면 문제 해결)
        try {
          map.relayout();
          console.log('🔄 지도 강제 리렌더링 완료');
          
          // 추가적인 지도 리렌더링 시도
          setTimeout(() => {
            if (mapRef.current) {
              const mapElement = mapRef.current;
              console.log('📏 지도 컨테이너 크기:', `${mapElement.offsetWidth}x${mapElement.offsetHeight}`);
              
              // 크기가 0이면 강제로 크기 설정 후 리렌더링
              if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
                console.warn('⚠️ 지도 컨테이너 크기가 0 - 강제 크기 설정');
                mapElement.style.width = '100%';
                mapElement.style.height = '100%';
                map.relayout();
              }
            }
          }, 100);
          
        } catch (error) {
          console.warn('⚠️ 지도 리렌더링 실패:', error);
        }
      } else {
        console.warn('⚠️ 지도 초기화 실패 - map 또는 kakaoObj가 없음');
      }
    }, 500);
    
    // 가게 정보 먼저 로드
    const loadedStores = await loadStoresByCity(city);
    
    // 첫 번째 업체 자동 선택 (업체가 있는 경우)
    if (loadedStores && loadedStores.length > 0) {
      const firstStore = loadedStores[0];
      setSelectedMarkerId(firstStore.id);
      console.log(`🎯 ${city} 첫 번째 업체 자동 선택:`, firstStore.name);
      
      // 지도 중심을 첫 번째 업체로 이동
      if (kakaoObj && map) {
        const center = new kakaoObj.maps.LatLng(firstStore.lat, firstStore.lng);
        map.setCenter(center);
        map.setLevel(6); // 업체 주변을 잘 보이도록 줌 레벨 조정
        console.log(`🗺️ ${city} 첫 번째 업체로 지도 중심 이동:`, firstStore.name);
        
        // 마커 강조 처리는 useEffect에서 자동으로 처리됨
        console.log(`📍 ${firstStore.name} 마커 강조 처리 준비 완료`);
        
        // 현재 위치 표시 (stores 데이터가 로드된 후)
        if (getCurrentLocation) {
          setTimeout(() => {
            try {
              getCurrentLocation();
            } catch (error) {
              console.error('❌ 현재 위치 표시 실패:', error);
            }
          }, 1000);
        }
      }
      
      // 첫 번째 업체로 하단 리스트 앵커링 (즉시)
      setTimeout(() => {
        const el = document.querySelector(`[data-card-id="${CSS.escape(firstStore.id)}"]`);
        if (el) {
          el.scrollIntoView({behavior:'auto',inline:'center',block:'nearest'});
          console.log(`📍 ${firstStore.name} 하단 리스트 앵커링 완료`);
        }
      }, 100);
    } else {
      // 업체가 없는 경우 시청/군청으로 이동
      if (kakaoObj && map) {
        const ps = new kakaoObj.maps.services.Places();
        ps.keywordSearch(`${city}청`, (data, status) => {
          if (status === kakaoObj.maps.services.Status.OK && data[0]) {
            const center = new kakaoObj.maps.LatLng(+data[0].y, +data[0].x);
            map.setCenter(center);
            map.setLevel(8); // 적절한 줌 레벨로 설정
            console.log(`🗺️ ${city} 시청/군청으로 지도 중심 이동:`, data[0].place_name);
          } else {
            console.warn(`⚠️ ${city} 시청/군청 검색 실패:`, status);
            // 기본 좌표로 이동 (경기도 중심)
            const defaultCenter = new kakaoObj.maps.LatLng(37.4138, 127.5183);
            map.setCenter(defaultCenter);
            map.setLevel(8);
          }
        });
      }
    }
  };

  // 뒤로가기
  const onBack = () => {
    console.log('🔙 뒤로가기 시작 - 지도 상태 정리');
    
    // 지도 상태 먼저 정리
    if (resetMapState) {
      console.log('🔄 지도 상태 초기화 시작');
      resetMapState();
      console.log('✅ 지도 상태 초기화 완료');
    }
    
    // 앱 상태 정리
    setMode('region');
    setSelectedCity('');
    setSelectedMarkerId(null);
    setIsNearbyEnabled(false);
    setMyPos(null);
    setShowRouteInfo(false);
    
    // 원 정리
    if (circle) {
      circle.setMap(null);
      setCircle(null);
    }
    
    console.log('✅ 뒤로가기 완료 - 모든 상태 정리됨');
  };

  // 내주변 검색 비활성화
  const handleNearbyDisable = () => {
    console.log('내주변 검색 비활성화');
    setIsNearbyEnabled(false);
    setMyPos(null);
    if (circle) {
      circle.setMap(null);
      setCircle(null);
    }
  };

  // 내 주변 검색 (최적화)
  const handleNearby = async () => {
    if (!map || !kakaoObj) return;
    if (!navigator.geolocation) {
      alert('위치 정보를 사용할 수 없습니다.');
      return;
    }

    try {
      // 실제 위치 정보 사용
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });
      
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      const loc = new kakaoObj.maps.LatLng(latitude, longitude);
      
      setMyPos({ lat: latitude, lng: longitude });
      
      // 지도 중심을 현재 위치로 이동
      map.setCenter(loc);
      map.setLevel(6); // 적절한 줌 레벨
      
      // 기존 원 제거
      if (circle) {
        circle.setMap(null);
        setCircle(null);
      }
      
      // 새로운 원 생성
      const newCircle = new kakaoObj.maps.Circle({
        center: loc,
        radius: radius,
        strokeWeight: 2,
        strokeColor: '#FF7419',
        strokeOpacity: 0.9,
        fillColor: '#FF7419',
        fillOpacity: 0.15
      });
      newCircle.setMap(map);
      setCircle(newCircle);

      // 내주변 검색 활성화 상태로 설정
      setIsNearbyEnabled(true);
      
      console.log('🎯 내위치 설정 완료:', { 
        latitude, 
        longitude, 
        radius
      });
      
      // 재검색 기능 제거됨
      
    } catch (error) {
      console.error('내위치 설정 실패:', error);
      alert('위치 정보를 가져오는데 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 경로 안내 (딥링크 기반)
  const handleDirections = async (store, transitMode) => {
    try {
      console.log('🗺️ 딥링크 길찾기 시작:', { store, transitMode });
      
      // 현재 위치 또는 폴백 좌표 가져오기
      const from = await getUserLocOrFallback({ 
        name: '판교역', 
        lat: 37.3948, 
        lng: 127.1111 
      });
      
      const to = { 
        name: store.name, 
        lat: store.lat, 
        lng: store.lng 
      };
      
      // UI 모드를 API 모드로 변환
      const apiMode = uiModeToApi(transitMode);
      console.log('🔀 이동수단 변환:', { uiMode: transitMode, apiMode });
      
      // 카카오맵 길찾기 URL 생성
      const directionsUrl = buildKakaoDirectionsUrl(apiMode, from, to);
      console.log('🔗 길찾기 URL:', directionsUrl);
      
      // 새 탭에서 카카오맵 길찾기 열기
      window.open(directionsUrl, '_blank', 'noopener');
      
      // 자동차 모드일 때 서버 기반 경로 시각화 (확장 포인트)
      if (apiMode === 'car') {
        console.log('🚗 자동차 모드 - 서버 기반 경로 시각화 가능');
        // TODO: useServerDirections 옵션이 활성화되면 여기서 경로 시각화 구현
      }
      
    } catch (error) {
      console.error('❌ 딥링크 길찾기 실패:', error);
      alert('길찾기를 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  // 경로 안내 모달 닫기
  const closeRouteInfo = () => {
    setShowRouteInfo(false);
    setRouteInfo(null);
  };

  // 하단 리스트 토글
  const handleBottomListToggle = () => {
    setIsBottomListExpanded(!isBottomListExpanded);
  };

  // 헤더 높이 업데이트
  useEffect(() => {
    if (headerRef.current) {
      const updateHeaderHeight = () => {
        const h = headerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--headerH', `${Math.ceil(h)}px`);
      };
      
      updateHeaderHeight();
      
      const resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(headerRef.current);
      
      return () => {
        if (headerRef.current) {
          resizeObserver.unobserve(headerRef.current);
        }
      };
    }
  }, [mode, searchName, category]);

  // 스플래시 화면이 표시되는 동안 메인 앱을 숨김
  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={() => setShowSplash(false)}
      />
    );
  }

  // 딥링크 기반 길찾기
  const handleRoute = async (store, transitMode = '자차') => {
    // 딥링크 길찾기 실행 (이동수단 직접 전달)
    await handleDirections(store, transitMode);
  };

  // 상세 보기 핸들러
  const handleViewDetail = (store) => {
    console.log('🔍 상세 보기:', store.name);
    setDetailStore(store);
    setShowPlaceDetail(true);
  };

  // 상세 보기 닫기
  const handleCloseDetail = () => {
    setShowPlaceDetail(false);
    setDetailStore(null);
  };

  // 경로 선택 처리 (딥링크 기반)
  const handleRouteSelect = async (routeType) => {
    if (!selectedStore) return;
    
    // 이동수단을 routeType에 맞게 설정
    let newTransitMode = '자차';
    switch (routeType) {
      case 'walk':
        newTransitMode = '도보';
        break;
      case 'transit':
        newTransitMode = '대중교통';
        break;
      case 'car':
        newTransitMode = '자차';
        break;
    }
    
    // 딥링크 길찾기 실행
    await handleDirections(selectedStore, newTransitMode);
    
    // 모달 닫기
    setShowRouteModal(false);
  };

  return (
    <div className={`frame ${mode === 'region' ? 'region-page' : ''}`}>
      <Header
        mode={mode}
        searchName={searchName}
        setSearchName={setSearchName}
        category={category}
        setCategory={setCategory}
        stores={stores}
        onBack={() => setMode('region')}
      />

      {mode === 'region' && (
        <>
          {enableDebugTopo ? (
            <DebugTopo />
          ) : enableNaverStyleTest ? (
            <NaverStyleTest />
          ) : (
            <div className="bg-white">
              {/* 메인 컨텐츠 */}
              <div className="px-4 main-content-responsive">
                <div className="text-center mb-2">
                  <p className="text-2xl font-bold text-gray-600">지역화폐를 쓸 곳을 선택해주세요.</p>
                </div>
                {enableNaverStylePicker ? (
                  <RegionPickerGyeonggi 
                    onSelectCity={(city) => {
                      console.log('선택된 도시:', city);
                      enterCity(city.label); // 기존 enterCity 함수 사용
                    }}
                    className="mb-8"
                  />
                ) : (
                  <div className="region-grid-container">
                    <RegionGrid onCitySelect={enterCity} />
                  </div>
                )}
              </div>
              
              {/* 지역 선택 화면 푸터 - 업체 검색화면과 동일한 스타일 */}
              <footer className="bg-white border-t border-gray-200 py-2 flex-shrink-0">
                <div className="max-w-6xl mx-auto px-4 text-center">
                  <p className="text-xs text-gray-500">
                    © kai.jeong — Contact: kai.jeong0@gmail.com
                  </p>
                </div>
              </footer>
            </div>
          )}
        </>
      )}

      {mode === 'map' && (
        <>
          <div className="map-wrap flex-1 relative">
            {/* PC 환경에서 쿠팡 배너 표시 (지도 컨테이너 내부) - 임시 숨김 */}
            {/* {isPC && (
              <CoupangBanner position="left" />
            )} */}
            
            <div ref={mapRef} className="map" />
            
            {/* 현 지도에서 검색 버튼 */}
            {showSearchButton && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                <button
                  onClick={() => manualMarkerUpdate(() => setListUpdateTrigger(prev => prev + 1))}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  현 지도에서 검색
                </button>
              </div>
            )}
            
            {/* 지도 로딩 실패 시 안내 메시지 */}
            {!map && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm mx-4">
                  <div className="text-4xl mb-4">🗺️</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">지도를 불러올 수 없습니다</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    카카오맵 서비스 연결에 문제가 발생했습니다.
                  </p>
                  <div className="space-y-2 text-xs text-left bg-gray-50 p-3 rounded">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      인터넷 연결 확인
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      페이지 새로고침
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      잠시 후 다시 시도
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    새로고침
                  </button>
                </div>
              </div>
            )}
            
            {/* 내 위치 버튼 */}
            <button 
              className="my-location-btn"
              onClick={handleNearby}
              aria-label="내 위치 표시"
              title="내 위치 표시"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            
            
            {/* Route Duration Info (Bottom Left) */}
            {routeInfo && routeInfo.duration > 0 && (
              <div className="route-duration-info">
                <div className="duration-badge">
                  <span className="duration-text">{routeInfo.duration}분</span>
                  <span className="route-type">{routeInfo.type}</span>
                </div>
              </div>
            )}
            
            {/* 경로 미리보기 정보 (Top Right) */}
            {routePreview && (
              <div className="route-preview-info">
                <div className="preview-card">
                  <div className="preview-header">
                    <span className="preview-icon">🗺️</span>
                    <span className="preview-title">경로 미리보기</span>
                    <button 
                      className="preview-close"
                      onClick={() => setRoutePreview(null)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="preview-content">
                    <div className="preview-route">
                      <div className="route-point">
                        <span className="point-label">출발</span>
                        <span className="point-name">{routePreview.from.name}</span>
                      </div>
                      <div className="route-arrow">→</div>
                      <div className="route-point">
                        <span className="point-label">도착</span>
                        <span className="point-name">{routePreview.to.name}</span>
                      </div>
                    </div>
                    <div className="preview-stats">
                      <div className="stat-item">
                        <span className="stat-label">거리</span>
                        <span className="stat-value">{(routePreview.distance/1000).toFixed(1)}km</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">예상시간</span>
                        <span className="stat-value">{routePreview.estimatedTime}분</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">이동수단</span>
                        <span className="stat-value">
                          {routePreview.mode === 'walk' ? '🚶 도보' : 
                           routePreview.mode === 'traffic' ? '🚌 대중교통' : '🚗 자차'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 소요시간 표시 (Bottom Left) */}
            {showTimeDisplay && routeInfo && (
              <div className="route-duration-info">
                <div className="duration-badge">
                  <span className="duration-text">{routeInfo.duration}분</span>
                  <span className="route-type">{routeInfo.type}</span>
                </div>
              </div>
            )}
          </div>
          
          <BottomList
            stores={finalShown}
            selectedId={selectedMarkerId}
            loading={loading}
            selectedCity={selectedCity}
            onSelect={(store) => {
              // 카드 클릭 시 마커 상태 동기화
              setSelectedMarkerId(store.id);
              // 지도 중심을 해당 업체로 이동
              if (map && kakaoObj) {
                const position = new kakaoObj.maps.LatLng(store.lat, store.lng);
                map.setCenter(position);
                map.setLevel(4); /* 적절한 줌 레벨로 조정 */
                
                // 마커 강조 효과는 useKakaoMap 훅에서 자동으로 처리됨
                // 마커 업데이트를 통해 선택된 마커 하이라이팅
                updateMarkers(finalShown, (selectedStore) => {
                  // 하단 리스트에서 해당 업체로 즉시 스크롤 (애니메이션 제거)
                  const el = document.querySelector(`[data-card-id="${CSS.escape(selectedStore.id)}"]`);
                  if (el) {
                    el.scrollIntoView({behavior:'auto',inline:'center',block:'nearest'});
                  }
                }, false, store.id, category); // 정보창 표시 비활성화, 선택된 업체 ID 전달, 카테고리 전달
                
                console.log(`📍 ${store.name} 마커 하이라이팅 처리 완료`);
              }
            }}
            onRoute={handleRoute}
            onViewDetail={handleViewDetail}
          />
          
          {/* 업체 검색화면 푸터 */}
          <footer className="bg-white border-t border-gray-200 py-2">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <p className="text-xs text-gray-500">
                © kai.jeong — Contact: kai.jeong0@gmail.com
              </p>
            </div>
          </footer>
        </>
      )}

      {/* 경로 안내 모달 */}
      {showRouteInfo && routeInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">경로 안내</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">이동 방식:</span>
                  <span className="font-medium">{routeInfo.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">거리:</span>
                  <span className="font-medium">{routeInfo.distance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">소요시간:</span>
                  <span className="font-medium">{routeInfo.duration}분</span>
                </div>
              </div>
              <button
                onClick={closeRouteInfo}
                className="w-full bg-carrot text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <RouteModal
        isOpen={showRouteModal}
        store={selectedStore}
        onClose={() => setShowRouteModal(false)}
        onRouteSelect={handleRouteSelect}
      />

      {/* Google Places 상세 보기 */}
      <PlaceDetailView
        store={detailStore}
        isOpen={showPlaceDetail}
        onClose={handleCloseDetail}
      />
    </div>
  );
}