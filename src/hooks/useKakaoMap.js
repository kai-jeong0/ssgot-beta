import { useState, useEffect, useRef } from 'react';

const KAKAO_JAVASCRIPT_KEY = "cf29dccdc1b81db907bf3cab84679703";

export const useKakaoMap = (mode) => {
  const [kakaoObj, setKakaoObj] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [markerMap, setMarkerMap] = useState({});
  const [currentInfo, setCurrentInfo] = useState(null);
  const mapRef = useRef(null);

  // 카카오맵 SDK 로드
  const loadKakao = (key) => {
    return new Promise((resolve, reject) => {
      console.log('카카오맵 로딩 시작...', key);
      if (window.kakao && window.kakao.maps) {
        console.log('이미 로드된 카카오맵 사용');
        resolve(window.kakao);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${key}&libraries=services`;
      script.async = true;
      
      script.onload = () => {
        console.log('카카오맵 SDK 스크립트 로드 완료');
        if (!window.kakao) {
          console.error('카카오 객체를 찾을 수 없음');
          return reject(new Error('no kakao'));
        }
        
        window.kakao.maps.load(() => {
          console.log('카카오맵 초기화 완료');
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
    
    // 기본 마커 이미지 (일반적인 핀 - 약함처리)
    const defaultMarker = new kakaoObj.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
      new kakaoObj.maps.Size(36, 37),
      { offset: new kakaoObj.maps.Point(18, 37) }
    );
    
    // 선택된 마커 이미지 (강조된 핀 - 파란색)
    const selectedMarker = new kakaoObj.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
      new kakaoObj.maps.Size(36, 37),
      { offset: new kakaoObj.maps.Point(18, 37) }
    );
    
    // 약함처리된 마커 이미지 (투명도 낮춤)
    const dimmedMarker = new kakaoObj.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
      new kakaoObj.maps.Size(36, 37),
      { offset: new kakaoObj.maps.Point(18, 37) }
    );
    
    const mm = {};
    const newMarkers = stores.map(store => {
      // 선택된 업체인지 확인하여 마커 이미지 결정
      const isSelected = selectedId === store.id;
      const markerImage = isSelected ? selectedMarker : dimmedMarker;
      
      const marker = new kakaoObj.maps.Marker({
        position: new kakaoObj.maps.LatLng(store.lat, store.lng),
        title: store.name,
        image: markerImage,
        opacity: isSelected ? 1.0 : 0.4 // 선택되지 않은 마커는 투명도 낮춤
      });
      
      marker.setMap(map);
      
      // 마커 클릭 이벤트
      kakaoObj.maps.event.addListener(marker, 'click', () => {
        // 기존 정보창 닫기
        if (currentInfo) {
          currentInfo.close();
          setCurrentInfo(null);
        }
        
        // 모든 마커를 약함처리
        Object.values(mm).forEach(m => {
          m.setImage(dimmedMarker);
          m.setOpacity(0.4);
        });
        
        // 현재 마커를 선택된 이미지로 강조
        marker.setImage(selectedMarker);
        marker.setOpacity(1.0);
        
        // 콜백 실행 (하단 리스트 앵커링)
        onMarkerClick(store);
      });
      
      mm[store.id] = marker;
      return marker;
    });
    
    setMarkers(newMarkers);
    setMarkerMap(mm);
    
    console.log(`마커 업데이트 완료: ${newMarkers.length}개 마커 생성, 선택된 마커 하이라이팅 완료`);
  };

  // 마커 강조 해제
  const clearMarkerHighlight = () => {
    if (!map || !kakaoObj) return;
    
    Object.values(markerMap).forEach(marker => {
      marker.setImage(null);
    });
  };

  return {
    kakaoObj,
    map,
    mapRef,
    markers,
    markerMap,
    currentInfo,
    updateMarkers,
    clearMarkerHighlight
  };
};
