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
      const center = new kakaoObj.maps.LatLng(37.440, 127.137);
      const newMap = new kakaoObj.maps.Map(mapRef.current, { center, level: 6 });
      console.log('지도 생성 완료');
      setMap(newMap);
    } catch (error) {
      console.error('지도 초기화 실패:', error);
    }
  }, [kakaoObj, mode]);

  // 마커 관리 (성능 최적화)
  const updateMarkers = (stores, onMarkerClick, showInfoWindow = false) => {
    if (!map || !kakaoObj) return;
    
    console.log(`마커 업데이트 시작: ${stores.length}개 업체`);
    
    // 기존 마커 제거
    markers.forEach(mk => mk.setMap(null));
    
    const star = new kakaoObj.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', 
      new kakaoObj.maps.Size(24, 35)
    );
    
    const mm = {};
    const newMarkers = stores.map(store => {
      const marker = new kakaoObj.maps.Marker({
        position: new kakaoObj.maps.LatLng(store.lat, store.lng),
        title: store.name
      });
      
      marker.setMap(map);
      
      // 마커 클릭 이벤트 (상세 정보 탭 비활성화)
      kakaoObj.maps.event.addListener(marker, 'click', () => {
        // 기존 정보창 닫기
        if (currentInfo) {
          currentInfo.close();
          setCurrentInfo(null);
        }
        
        // 강조 토글 (이전 선택 해제)
        Object.values(mm).forEach(m => m.setImage(null));
        
        // 현재 마커 강조
        marker.setImage(star);
        
        // 콜백 실행 (하단 리스트 앵커링)
        onMarkerClick(store);
      });
      
      mm[store.id] = marker;
      return marker;
    });
    
    setMarkers(newMarkers);
    setMarkerMap(mm);
    
    console.log(`마커 업데이트 완료: ${newMarkers.length}개 마커 생성`);
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
