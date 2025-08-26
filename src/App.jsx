import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import RegionGrid from './components/RegionGrid';
import RegionPickerGyeonggi from './components/region/RegionPickerGyeonggi';
import NaverStyleRegionPicker from './components/region/NaverStyleRegionPicker';
import NaverStyleTest from './components/region/NaverStyleTest';
import DebugTopo from './components/debug/DebugTopo';
import BottomList from './components/BottomList';
import RouteModal from './components/RouteModal';
import { useKakaoMap } from './hooks/useKakaoMap';
import { useStores } from './hooks/useStores';
import './App.css';

export default function App() {
  // 기본 상태
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
  const [isBottomListExpanded, setIsBottomListExpanded] = useState(true); // 항상 열린 상태로 변경
  
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
  const { kakaoObj, map, mapRef, markers, markerMap, updateMarkers } = useKakaoMap(mode);

  // 검색 필터링
  useEffect(() => {
    if (!searchName) {
      setFiltered(stores);
      return;
    }
    const query = searchName.trim();
    setFiltered(stores.filter(s => s.name && s.name.includes(query)));
  }, [searchName, stores, setFiltered]);

  // 카테고리 필터링 (디버깅 로그 추가)
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

    // 카테고리 필터링 적용
    if (category !== 'all') {
      const beforeFilter = result.length;
      result = result.filter(s => s.category === category);
      console.log(`카테고리 필터링 결과: ${beforeFilter}개 → ${result.length}개`);
    }

    console.log('최종 결과:', result.length);
    return result;
  }, [filtered, isNearbyEnabled, myPos, circle, radius, category]);

  // 마커 업데이트 (성능 최적화)
  useEffect(() => {
    if (finalShown.length > 0) {
      console.log(`마커 업데이트: ${finalShown.length}개 업체`);
      updateMarkers(finalShown, (store) => {
        setSelectedId(store.id);
        // 하단 리스트에서 해당 업체로 스크롤
        const el = document.querySelector(`[data-card-id="${CSS.escape(store.id)}"]`);
        if (el) {
          el.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
        }
      });
    } else {
      // 업체가 없으면 마커 강조 해제
      if (kakaoObj && map) {
        Object.values(markerMap).forEach(marker => {
          marker.setImage(null);
        });
      }
    }
  }, [finalShown, updateMarkers, kakaoObj, map, markerMap]);

  // 도시 선택
  const enterCity = async (city) => {
    setSelectedCity(city);
    setMode('map');
    setCategory('all');
    setSelectedId(null);
    
    // 카카오맵으로 도시 중심 이동
    if (kakaoObj && map) {
      const ps = new kakaoObj.maps.services.Places();
      ps.keywordSearch(`${city}청`, (data, status) => {
        if (status === kakaoObj.maps.services.Status.OK && data[0]) {
          const center = new kakaoObj.maps.LatLng(+data[0].y, +data[0].x);
          map.setCenter(center);
        }
      });
    }
    
    // 가게 정보 로드
    await loadStoresByCity(city);
  };

  // 뒤로가기
  const onBack = () => {
    setMode('region');
    setSelectedCity('');
    setSelectedId(null);
    setIsNearbyEnabled(false);
    setMyPos(null);
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
      // 성남시 테스트를 위한 알파돔타워 좌표 사용
      let latitude, longitude;
      
      if (selectedCity === '성남시') {
        console.log('🧪 성남시 테스트 - 알파돔타워 좌표 사용');
        latitude = 37.4012;
        longitude = 127.1101;
      } else {
        // 다른 지역은 실제 위치 정보 사용
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }
      const loc = new kakaoObj.maps.LatLng(latitude, longitude);
      
      setMyPos({ lat: latitude, lng: longitude });
      map.setCenter(loc);
      
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

      // 먼저 내주변 검색 활성화 상태로 설정
      setIsNearbyEnabled(true);
      
      console.log('🎯 내주변 검색 설정:', { 
        latitude, 
        longitude, 
        radius, 
        selectedCity,
        currentStoresCount: stores.length 
      });
      
      // 성남시 테스트의 경우 지역구 조회 스킵
      if (selectedCity === '성남시') {
        console.log('🚀 성남시 테스트 - 기존 데이터 사용');
        console.log('현재 stores 샘플:', stores.slice(0, 3).map(s => ({ name: s.name, lat: s.lat, lng: s.lng })));
      } else {
        // 다른 지역은 현재 위치의 시군구 정보 조회 (비동기 처리)
        const geocoder = new kakaoObj.maps.services.Geocoder();
        geocoder.coord2RegionCode(longitude, latitude, async (result, status) => {
          if (status === kakaoObj.maps.services.Status.OK) {
            const siGun = result.find(r => r.region_type === 'H')?.region_2depth_name || selectedCity;
            console.log('내주변 검색 - 시군구 정보:', siGun);
            
            if (siGun && siGun !== selectedCity) {
              setSelectedCity(siGun);
            }
            
            // 가게 정보 로드
            console.log('내주변 검색 - 가게 정보 로드 시작');
            await loadStoresByCity(siGun);
            console.log('내주변 검색 - 가게 정보 로드 완료');
          }
        });
      }
      
    } catch (error) {
      console.error('내주변 검색 실패:', error);
      alert('위치 정보를 가져오는데 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 길찾기
  const handleRoute = (store) => {
    setSelectedStore(store);
    setShowRouteModal(true);
  };

  const handleRouteSelect = (routeType) => {
    if (!selectedStore) return;
    
    const { lat, lng, name } = selectedStore;
    let routeUrl = '';
    
    // 현재 위치가 있으면 출발지로 설정
    if (myPos) {
      const { lat: startLat, lng: startLng } = myPos;
      switch (routeType) {
        case 'walk':
          routeUrl = `https://map.kakao.com/link/route/${startLat},${startLng}/${lat},${lng}?mode=walk`;
          break;
        case 'transit':
          routeUrl = `https://map.kakao.com/link/route/${startLat},${startLng}/${lat},${lng}?mode=transit`;
          break;
        case 'car':
          routeUrl = `https://map.kakao.com/link/route/${startLat},${startLng}/${lat},${lng}?mode=car`;
          break;
        default:
          routeUrl = `https://map.kakao.com/link/route/${startLat},${startLng}/${lat},${lng}`;
      }
    } else {
      // 현재 위치가 없으면 기존 방식 사용
    switch (routeType) {
      case 'walk':
        routeUrl = `https://map.kakao.com/link/to/${name},${lat},${lng}?mode=walk`;
        break;
      case 'transit':
        routeUrl = `https://map.kakao.com/link/to/${name},${lat},${lng}?mode=transit`;
        break;
      case 'car':
        routeUrl = `https://map.kakao.com/link/to/${name},${lat},${lng}?mode=car`;
        break;
      default:
        routeUrl = `https://map.kakao.com/link/to/${name},${lat},${lng}`;
      }
    }
    
    window.open(routeUrl, '_blank');
    setShowRouteModal(false);
    setSelectedStore(null);
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

  return (
    <div className="frame">
      <Header
        mode={mode}
        searchName={searchName}
        setSearchName={setSearchName}
        onBack={onBack}
        category={category}
        setCategory={setCategory}

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
          <div className="map-wrap flex-1">
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
                map.setLevel(3); // 줌 레벨 조정
                
                // 마커 강조 효과 (주황색)
                Object.values(markerMap).forEach(marker => {
                  // 기본 마커로 리셋
                  const normalImage = new kakaoObj.maps.MarkerImage(
                    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                    new kakaoObj.maps.Size(36, 37),
                    { offset: new kakaoObj.maps.Point(18, 37) }
                  );
                  marker.setImage(normalImage);
                });
                
                if (markerMap[store.id]) {
                  // 선택된 마커를 주황색으로 강조
                  const highlightImage = new kakaoObj.maps.MarkerImage(
                    'data:image/svg+xml;base64,' + btoa(`
                      <svg width="36" height="37" viewBox="0 0 36 37" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 0c-7.2 0-13 5.8-13 13 0 7.2 13 24 13 24s13-16.8 13-24c0-7.2-5.8-13-13-13z" fill="#FF7419"/>
                        <circle cx="18" cy="13" r="6" fill="white"/>
                      </svg>
                    `),
                    new kakaoObj.maps.Size(36, 37),
                    { offset: new kakaoObj.maps.Point(18, 37) }
                  );
                  markerMap[store.id].setImage(highlightImage);
                }
              }
            }}
            onRoute={handleRoute}
          />
        </>
      )}

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-primary-body">
            © kai.jeong — Contact: kai.jeong0@gmail.com
          </p>
        </div>
      </footer>

      <RouteModal
        isOpen={showRouteModal}
        store={selectedStore}
        onClose={() => setShowRouteModal(false)}
        onRouteSelect={handleRouteSelect}
      />
    </div>
  );
}