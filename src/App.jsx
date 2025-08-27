import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import RegionGrid from './components/RegionGrid';
import RegionPickerGyeonggi from './components/region/RegionPickerGyeonggi';
import NaverStyleRegionPicker from './components/region/NaverStyleRegionPicker';
import NaverStyleTest from './components/region/NaverStyleTest';
import DebugTopo from './components/debug/DebugTopo';
import BottomList from './components/BottomList';
import RouteModal from './components/RouteModal';
import SplashScreen from './components/SplashScreen';
import { useKakaoMap } from './hooks/useKakaoMap';
import { useStores } from './hooks/useStores';
import './App.css';

export default function App() {
  // 기본 상태
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState('region');
  const [selectedCity, setSelectedCity] = useState('');
  const [category, setCategory] = useState('all');
  const [searchName, setSearchName] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [myPos, setMyPos] = useState(null);
  const [circle, setCircle] = useState(null);
  const [isNearbyEnabled, setIsNearbyEnabled] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isBottomListExpanded, setIsBottomListExpanded] = useState(true);
  
  // 새로운 상태들
  const [showResearchButton, setShowResearchButton] = useState(false);
  const [currentMapCenter, setCurrentMapCenter] = useState(null);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  
  // Feature flags for region pickers (can be toggled via env or prop)
  const enableGyeonggiPicker = false; // 기존 그리드 스타일
  const enableNaverStylePicker = false; // 네이버 스타일 지도 기반 비활성화
  const enableNaverStyleTest = false; // 네이버 스타일 테스트 페이지
  const enableDebugTopo = false; // TopoJSON 디버그 페이지 비활성화 (서비스 모드)
  
  const headerRef = useRef(null);
  const radius = 500;

  // 서비스 모드: 디버그 라우팅 비활성화

  // 커스텀 훅 사용
  const { stores, filtered, loading, loadStoresByCity, setFiltered } = useStores();
  const { kakaoObj, map, mapRef, markers, markerMap, updateMarkers, clearMarkerHighlight, selectedMarkerId } = useKakaoMap(mode);

  // 검색 필터링 (학원 카테고리 포함)
  useEffect(() => {
    if (!searchName) {
      setFiltered(stores);
      return;
    }
    const query = searchName.trim();
    setFiltered(stores.filter(s => s.name && s.name.includes(query)));
  }, [searchName, stores, setFiltered]);

  // 카테고리 필터링 (학원 카테고리 포함)
  const finalShown = useMemo(() => {
    let result = filtered;
    
    console.log('finalShown 계산:', {
      filteredCount: filtered.length,
      isNearbyEnabled,
      hasMyPos: !!myPos,
      hasCircle: !!circle,
      category
    });
    
    // 내 주변 필터링 제거 - 이제 지도에 내 위치만 표시

    // 카테고리 필터링 적용 (학원 카테고리 포함)
    if (category !== 'all') {
      const beforeFilter = result.length;
      result = result.filter(s => s.category === category);
      console.log(`카테고리 필터링 결과: ${beforeFilter}개 → ${result.length}개`);
    }

    console.log('최종 결과:', result.length);
    return result;
  }, [filtered, isNearbyEnabled, myPos, circle, radius, category]);

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
          setShowResearchButton(true);
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

  // 재검색 기능
  const handleResearch = async () => {
    if (!map || !kakaoObj) return;
    
    const center = map.getCenter();
    const currentLat = center.getLat();
    const currentLng = center.getLng();
    const currentLevel = map.getLevel();
    
    console.log(`🔄 재검색 시작: (${currentLat}, ${currentLng}) 줌레벨: ${currentLevel}`);
    
    // 현재 지도 영역에 포함되는 업체들 검색 (지역 제한 무시)
    const bounds = map.getBounds();
    const swLat = bounds.getSouthWest().getLat();
    const swLng = bounds.getSouthWest().getLng();
    const neLat = bounds.getNorthEast().getLat();
    const neLng = bounds.getNorthEast().getLng();
    
    const visibleStores = stores.filter(store => {
      return store.lat >= swLat && store.lat <= neLat && 
             store.lng >= swLng && store.lng <= neLng;
    });
    
    if (visibleStores.length > 0) {
      setFiltered(visibleStores);
      setShowResearchButton(false);
      console.log(`✅ 재검색 완료: ${visibleStores.length}개 업체 발견 (지역 제한 무시)`);
    } else {
      console.log('⚠️ 재검색 결과: 해당 지도 영역에 업체가 없습니다');
    }
  };

  // 마커 업데이트 (성능 최적화)
  useEffect(() => {
    if (finalShown.length > 0) {
      console.log(`마커 업데이트: ${finalShown.length}개 업체`);
      updateMarkers(finalShown, (store) => {
        setSelectedId(store.id);
        // 하단 리스트에서 해당 업체로 즉시 스크롤 (애니메이션 제거)
        const el = document.querySelector(`[data-card-id="${CSS.escape(store.id)}"]`);
        if (el) {
          el.scrollIntoView({behavior:'auto',inline:'center',block:'nearest'});
        }
      }, false, selectedId); // 정보창 표시 비활성화, selectedId 전달
      
              // 첫 번째 업체가 선택되지 않은 경우 자동 선택
        if (!selectedId && finalShown.length > 0) {
          const firstStore = finalShown[0];
          setSelectedId(firstStore.id);
          console.log(`🎯 첫 번째 업체 자동 선택:`, firstStore.name);
          
          // 첫 번째 업체로 하단 리스트 앵커링 (즉시)
          const el = document.querySelector(`[data-card-id="${CSS.escape(firstStore.id)}"]`);
          if (el) {
            el.scrollIntoView({behavior:'auto',inline:'center',block:'nearest'});
            console.log(`📍 ${firstStore.name} 하단 리스트 앵커링 완료`);
          }
        }
    } else {
      // 업체가 없으면 마커 강조 해제
      if (kakaoObj && map) {
        console.log('업체가 없어서 마커 강조 해제');
        clearMarkerHighlight();
      }
    }
  }, [finalShown, updateMarkers, kakaoObj, map, markerMap, selectedId]);

  // 도시 선택
  const enterCity = async (city) => {
    setSelectedCity(city);
    setMode('map');
    setCategory('all');
    setSelectedId(null);
    setShowResearchButton(false);
    
    // 가게 정보 먼저 로드
    const loadedStores = await loadStoresByCity(city);
    
    // 첫 번째 업체 자동 선택 (업체가 있는 경우)
    if (loadedStores && loadedStores.length > 0) {
      const firstStore = loadedStores[0];
      setSelectedId(firstStore.id);
      console.log(`🎯 ${city} 첫 번째 업체 자동 선택:`, firstStore.name);
      
      // 지도 중심을 첫 번째 업체로 이동
      if (kakaoObj && map) {
        const center = new kakaoObj.maps.LatLng(firstStore.lat, firstStore.lng);
        map.setCenter(center);
        map.setLevel(6); // 업체 주변을 잘 보이도록 줌 레벨 조정
        console.log(`🗺️ ${city} 첫 번째 업체로 지도 중심 이동:`, firstStore.name);
        
        // 마커 강조 처리는 useEffect에서 자동으로 처리됨
        console.log(`📍 ${firstStore.name} 마커 강조 처리 준비 완료`);
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
    setMode('region');
    setSelectedCity('');
    setSelectedId(null);
    setIsNearbyEnabled(false);
    setMyPos(null);
    setShowResearchButton(false);
    setShowRouteInfo(false);
    if (circle) {
      circle.setMap(null);
      setCircle(null);
    }
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
      
      // 현재 지도 영역에서 재검색 수행
      setTimeout(() => {
        handleResearch();
      }, 500);
      
    } catch (error) {
      console.error('내위치 설정 실패:', error);
      alert('위치 정보를 가져오는데 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 경로 안내 (새창 대신 모달 내에서 표시)
  const handleRoute = async (store) => {
    setSelectedStore(store);
    setShowRouteModal(true);
  };

  // 경로 선택 처리
  const handleRouteSelect = async (routeType) => {
    if (!selectedStore || !kakaoObj || !map) return;
    
    // 현재 위치 정보 가져오기
    if (!myPos) {
      try {
        if (!navigator.geolocation) {
          alert('위치 정보를 사용할 수 없습니다.');
          return;
        }
        
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setMyPos({ lat: latitude, lng: longitude });
        
        // 지도 중심을 현재 위치로 이동
        if (map && kakaoObj) {
          const loc = new kakaoObj.maps.LatLng(latitude, longitude);
          map.setCenter(loc);
          
          // 내 위치 표시 원 생성
          if (circle) {
            circle.setMap(null);
          }
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
        }
        
        console.log('📍 경로 안내를 위해 현재 위치 정보 가져옴:', { latitude, longitude });
        
      } catch (error) {
        console.error('경로 안내 위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는데 실패했습니다. 경로 안내 기능을 사용할 수 없습니다.');
        return;
      }
    }
    
    // 경로 정보 가져오기 및 지도에 표시
    if (myPos && kakaoObj) {
      try {
        const { lat: startLat, lng: startLng } = myPos;
        const { lat: endLat, lng: endLng, name } = selectedStore;
        
        // 기존 경로 제거
        if (window.currentRoute) {
          window.currentRoute.setMap(null);
        }
        
        // 카카오맵 경로 검색 API 사용
        const directions = new kakaoObj.maps.services.Directions();
        
        // 경로 검색
        directions.route({
          origin: new kakaoObj.maps.LatLng(startLat, startLng),
          destination: new kakaoObj.maps.LatLng(endLat, endLng),
          priority: kakaoObj.maps.services.RoutePriority.FIRST
        }, (result, status) => {
          if (status === kakaoObj.maps.services.Status.OK) {
            const route = result.routes[0];
            const summary = route.summary;
            
            // 경로를 지도에 표시
            const path = route.sections[0].roads[0].vertexes;
            const points = [];
            
            for (let i = 0; i < path.length; i += 2) {
              points.push(new kakaoObj.maps.LatLng(path[i + 1], path[i]));
            }
            
            const polyline = new kakaoObj.maps.Polyline({
              path: points,
              strokeWeight: 5,
              strokeColor: '#FF7419',
              strokeOpacity: 0.8,
              strokeStyle: 'solid'
            });
            
            polyline.setMap(map);
            window.currentRoute = polyline;
            
            // 소요시간을 상태에 저장하여 좌측 하단에 표시
            const durationMinutes = Math.round(summary.duration / 60);
            setRouteInfo({
              distance: `${Math.round(summary.distance / 1000 * 10) / 10}km`,
              duration: durationMinutes,
              type: routeType === 'walk' ? '도보' : routeType === 'transit' ? '대중교통' : '자동차'
            });
            
            // 경로 정보 모달은 표시하지 않음 (지도상에 직접 표시)
            setShowRouteModal(false);
            
            console.log(`🗺️ ${routeType} 경로 표시 완료:`, {
              거리: summary.distance,
              시간: summary.duration
            });
            
          } else {
            console.error('경로 검색 실패:', status);
            // 기본 정보라도 표시
            setRouteInfo({
              distance: '계산 불가',
              duration: 0,
              type: routeType === 'walk' ? '도보' : routeType === 'transit' ? '대중교통' : '자동차'
            });
            setShowRouteModal(false);
          }
        });
        
      } catch (error) {
        console.error('경로 검색 실패:', error);
        // 기본 정보라도 표시
        setRouteInfo({
          distance: '계산 불가',
          duration: 0,
          type: routeType === 'walk' ? '도보' : routeType === 'transit' ? '대중교통' : '자동차'
        });
        setShowRouteModal(false);
      }
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

  return (
    <div className="frame">
      <Header
        mode={mode}
        searchName={searchName}
        setSearchName={setSearchName}
        onBack={onBack}
        category={category}
        setCategory={setCategory}
        stores={stores} // 업체 목록 전달
        ref={headerRef}
      />

      {mode === 'region' && (
        <>
          {enableDebugTopo ? (
            <DebugTopo />
          ) : enableNaverStyleTest ? (
            <NaverStyleTest />
          ) : enableNaverStylePicker ? (
            <div className="min-h-screen bg-gray-50 flex flex-col">
              {/* 네이버 스타일 지역 선택 */}
              <NaverStyleRegionPicker 
                initialProvince="경기도"
                onSelect={(selection) => {
                  console.log('🎯 최종 선택:', selection);
                  // 읍면동 단위로 지역화폐 상점 검색
                  const cityName = selection.emd.name;
                  enterCity(cityName);
                }}
                className="flex-1"
              />
            </div>
          ) : enableGyeonggiPicker ? (
            <div className="min-h-screen bg-gray-50 flex flex-col">
              {/* 헤더 섹션 */}
              <div className="bg-white py-8 px-4 text-center border-b">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">쓰곳</h1>
                <p className="text-sm sm:text-base text-gray-600">지역화폐 쓰는 곳</p>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-6">
                  💰 오늘은 어디서 지역화폐를 써볼까?
                </h2>
              </div>
              
              {/* 메인 컨텐츠 */}
              <div className="flex-1 py-8 px-4">
                <RegionPickerGyeonggi 
                  onSelectCity={(city) => {
                    console.log('선택된 도시:', city);
                    enterCity(city.label); // 기존 enterCity 함수 사용
                  }}
                  className="mb-8"
                />
              </div>
              
              {/* 푸터는 기존 위치에서 렌더링됨 */}
            </div>
          ) : (
            <RegionGrid onCitySelect={enterCity} />
          )}
        </>
      )}

      {mode === 'map' && (
        <>
          <div className="map-wrap flex-1 relative">
            <div ref={mapRef} className="map" />
            
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
            
            {/* 재검색 버튼 */}
            {showResearchButton && (
              <button 
                className="research-btn"
                onClick={handleResearch}
                aria-label="현재 위치에서 재검색"
                title="현재 위치에서 재검색"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span>재검색</span>
              </button>
            )}
            
            {/* 소요시간 표시 (좌측 하단) */}
            {routeInfo && routeInfo.duration > 0 && (
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
            selectedId={selectedId}
            loading={loading}
            selectedCity={selectedCity}
            onSelect={(store) => {
              setSelectedId(store.id);
              // 지도 중심을 해당 업체로 이동
              if (map && kakaoObj) {
                const position = new kakaoObj.maps.LatLng(store.lat, store.lng);
                map.setCenter(position);
                map.setLevel(4); // 적절한 줌 레벨로 조정
                
                // 마커 강조 효과 개선 (쓰곳 커스텀 아이콘 사용)
                const defaultMarker = new kakaoObj.maps.MarkerImage(
                  '/assets/marker-default.svg',
                  new kakaoObj.maps.Size(48, 49),
                  { offset: new kakaoObj.maps.Point(24, 49) }
                );
                
                const selectedMarker = new kakaoObj.maps.MarkerImage(
                  '/assets/marker-selected.svg',
                  new kakaoObj.maps.Size(48, 49),
                  { offset: new kakaoObj.maps.Point(24, 49) }
                );
                
                // 모든 마커를 기본 이미지로 리셋
                Object.values(markerMap).forEach(marker => {
                  marker.setImage(defaultMarker);
                });
                
                // 선택된 마커를 강조
                if (markerMap[store.id]) {
                  markerMap[store.id].setImage(selectedMarker);
                  console.log(`📍 ${store.name} 마커 하이라이팅 처리 완료`);
                }
              }
            }}
            onRoute={handleRoute}
          />
        </>
      )}

      {mode !== 'region' && (
        <footer className="bg-white border-t border-gray-200 py-2">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-500">
              © kai.jeong — Contact: kai.jeong0@gmail.com
            </p>
          </div>
        </footer>
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
    </div>
  );
}