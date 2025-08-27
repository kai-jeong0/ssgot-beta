/**
 * 카카오맵 길찾기 링크 생성을 위한 유틸리티 함수들
 */

// 타입 정의 (JSDoc)
/**
 * @typedef {Object} LatLng
 * @property {number} lat - 위도
 * @property {number} lng - 경도
 */

/**
 * @typedef {Object} Waypoint
 * @property {string} name - 장소명
 * @property {number} lat - 위도
 * @property {number} lng - 경도
 * @property {string} [placeId] - 카카오맵 placeId (선택사항)
 */

/**
 * @typedef {'car' | 'traffic' | 'walk'} DirectionsMode
 */

/**
 * @typedef {'도보' | '대중교통' | '자차'} UiMode
 */

/**
 * UI 모드를 API 모드로 변환
 * @param {UiMode} modeUi - UI에서 선택된 모드
 * @returns {DirectionsMode} API 모드
 */
export function uiModeToApi(modeUi) {
  switch (modeUi) {
    case '도보': return 'walk';
    case '대중교통': return 'traffic';
    case '자차': return 'car';
    default: return 'car';
  }
}

/**
 * 카카오맵 길찾기 URL 생성
 * @param {Object} params - 파라미터
 * @param {Waypoint} params.from - 출발지
 * @param {Waypoint} params.to - 목적지
 * @param {DirectionsMode} params.mode - 이동 수단 모드
 * @returns {string} 카카오맵 길찾기 URL
 */
export function buildKakaoDirectionsUrl(params) {
  const { from, to, mode } = params;
  
  // URL-safe 인코딩
  const enc = (s) => encodeURIComponent(s);
  
  if (to.placeId) {
    // placeId가 있는 경우 (목적지만 지정)
    return `https://map.kakao.com/link/to/${enc(to.placeId)}`;
  }
  
  // 출발지와 목적지 모두 좌표로 지정
  const fromSeg = `${enc(from.name)},${from.lat},${from.lng}`;
  const toSeg = `${enc(to.name)},${to.lat},${to.lng}`;
  
  return `https://map.kakao.com/link/by/${mode}/${fromSeg}/${toSeg}`;
}

/**
 * 사용자 현재 위치 또는 폴백 위치 가져오기
 * @param {Waypoint} fallback - 폴백 위치
 * @returns {Promise<Waypoint>} 사용자 위치 또는 폴백 위치
 */
export function getUserLocationOrFallback(fallback) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      return resolve(fallback);
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          name: '내 위치',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => resolve(fallback),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

/**
 * 새 탭에서 길찾기 링크 열기
 * @param {string} url - 길찾기 URL
 */
export function openDirections(url) {
  window.open(url, '_blank', 'noopener');
}

/**
 * 마커에 길찾기 기능 설정
 * @param {Array} markers - 카카오맵 마커 배열
 * @param {Object} opts - 옵션
 * @param {Waypoint} opts.fallbackFrom - 폴백 출발지
 * @param {Function} opts.getSelectedTransitMode - 현재 선택된 이동 수단 모드 반환 함수
 */
export function setupDirectionsForMarkers(markers, opts) {
  if (!window.kakao || !window.kakao.maps) {
    console.warn('카카오맵 API가 로드되지 않았습니다.');
    return;
  }

  const kakao = window.kakao;
  const iw = new kakao.maps.InfoWindow({ removable: true });

  markers.forEach((marker) => {
    // 마커에서 목적지 정보 추출
    const to = marker.__to || {
      name: marker.getTitle() || '목적지',
      lat: marker.getPosition().getLat(),
      lng: marker.getPosition().getLng(),
      placeId: marker.__placeId
    };

    // 마커 클릭 이벤트 리스너
    kakao.maps.event.addListener(marker, 'click', () => {
      const content = document.createElement('div');
      content.style.minWidth = '160px';
      content.style.padding = '12px';
      content.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <strong style="font-size:13px; color:#333;">${to.name}</strong>
          <button id="go-dir" style="
            font-size:12px; 
            padding:6px 12px; 
            background:#FF7419; 
            color:white; 
            border:none; 
            border-radius:4px; 
            cursor:pointer;
            font-weight:500;
          ">현재 선택 모드로 길찾기</button>
        </div>
      `;
      
      iw.setContent(content);
      iw.open(marker.getMap(), marker);

      // 길찾기 버튼 클릭 이벤트
      const btn = content.querySelector('#go-dir');
      if (btn) {
        btn.onclick = async () => {
          try {
            const from = await getUserLocationOrFallback(opts.fallbackFrom);
            const mode = opts.getSelectedTransitMode();
            const url = buildKakaoDirectionsUrl({ from, to, mode });
            
            console.log('🗺️ 길찾기 링크 생성:', {
              출발지: from.name,
              목적지: to.name,
              모드: mode,
              URL: url
            });
            
            openDirections(url);
            iw.close();
          } catch (error) {
            console.error('길찾기 링크 생성 실패:', error);
            alert('길찾기 링크를 생성할 수 없습니다. 다시 시도해주세요.');
          }
        };
      }
    });
  });
}
