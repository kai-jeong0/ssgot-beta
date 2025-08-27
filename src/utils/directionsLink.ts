export type DirectionsMode = 'walk' | 'traffic' | 'car';
export type Waypoint = { name: string; lat: number; lng: number };

export function buildKakaoDirectionsUrl(mode: DirectionsMode, from: Waypoint, to: Waypoint) {
  const enc = (s: string) => encodeURIComponent(s);
  return `https://map.kakao.com/link/by/${mode}/${enc(from.name)},${from.lat},${from.lng}/${enc(to.name)},${to.lat},${to.lng}`;
}

export async function getUserLocOrFallback(fallback: Waypoint): Promise<Waypoint> {
  return new Promise(res => {
    if (!navigator.geolocation) return res(fallback);
    navigator.geolocation.getCurrentPosition(
      pos => res({ name: '내 위치', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => res(fallback),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}

// UI 모드에서 API 모드로 매핑
export function uiModeToApi(uiMode: string): DirectionsMode {
  switch (uiMode) {
    case '도보': return 'walk';
    case '대중교통': return 'traffic';
    case '자차': return 'car';
    default: return 'car';
  }
}

// 자동차 모드용 서버 기반 경로 시각화 (확장 포인트)
export interface ServerDirectionsOptions {
  useServerDirections?: boolean;
  apiEndpoint?: string;
}

export async function getServerDirections(
  from: Waypoint, 
  to: Waypoint, 
  options: ServerDirectionsOptions = {}
): Promise<number[][] | null> {
  if (!options.useServerDirections) return null;
  
  try {
    const response = await fetch(
      `${options.apiEndpoint || '/api/directions'}?origin=${from.lng},${from.lat}&destination=${to.lng},${to.lat}`
    );
    
    if (!response.ok) {
      console.warn('서버 기반 경로 조회 실패:', response.status);
      return null;
    }
    
    const data = await response.json();
    // 응답에서 좌표 배열 추출 (실제 응답 구조에 따라 조정 필요)
    return data.routes?.[0]?.sections?.[0]?.roads?.[0]?.vertexes || null;
  } catch (error) {
    console.warn('서버 기반 경로 조회 중 오류:', error);
    return null;
  }
}
