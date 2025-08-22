/**
 * TopoJSON 유틸리티 라이브러리 (TypeScript)
 * 
 * TopoJSON → GeoJSON 변환 및 지도 SDK 연동을 위한 헬퍼 함수들
 */

import * as topojson from 'topojson-client';

export interface Topology {
  type: 'Topology';
  objects: Record<string, any>;
  arcs: number[][][];
  transform?: any;
  bbox?: number[];
}

export interface Feature {
  type: 'Feature';
  id?: string | number;
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: any;
  };
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
}

/**
 * TopoJSON 파일을 로드합니다
 * @param url - TopoJSON 파일 URL
 * @returns Promise<Topology>
 */
export async function loadTopo(url: string): Promise<Topology> {
  try {
    console.log(`🌐 TopoJSON 로드 시작: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const topology = await response.json() as Topology;
    console.log(`✅ TopoJSON 로드 완료:`, {
      type: topology.type,
      objects: Object.keys(topology.objects),
      bbox: topology.bbox
    });
    
    return topology;
  } catch (error) {
    console.error('❌ TopoJSON 로드 실패:', error);
    throw error;
  }
}

/**
 * TopoJSON을 GeoJSON FeatureCollection으로 변환합니다
 * @param topology - TopoJSON 객체
 * @param objectKey - 추출할 객체 키 ('sig' | 'emd')
 * @returns GeoJSON FeatureCollection
 */
export function toGeoJSON(topology: Topology, objectKey: 'sig' | 'emd' = 'sig'): FeatureCollection {
  try {
    console.log(`🔄 TopoJSON → GeoJSON 변환 시작: objectKey="${objectKey}"`);
    
    if (!topology.objects || !topology.objects[objectKey]) {
      const availableKeys = Object.keys(topology.objects || {});
      throw new Error(`TopoJSON에서 '${objectKey}' 객체를 찾을 수 없습니다. 사용 가능한 키: ${availableKeys.join(', ')}`);
    }
    
    const featureCollection = topojson.feature(topology, topology.objects[objectKey]) as FeatureCollection;
    
    console.log(`✅ GeoJSON 변환 완료:`, {
      type: featureCollection.type,
      featuresCount: featureCollection.features.length,
      sampleFeature: featureCollection.features[0]?.properties
    });
    
    return featureCollection;
  } catch (error) {
    console.error('❌ GeoJSON 변환 실패:', error);
    throw error;
  }
}

/**
 * GeoJSON 좌표를 카카오/네이버 지도 SDK용으로 변환합니다
 * [lng, lat] → [lat, lng] 순서 변환
 * @param coords - GeoJSON 좌표 배열
 * @returns SDK용 좌표 배열
 */
export function ensureLatLngOrder(coords: any): any {
  if (!Array.isArray(coords)) {
    return coords;
  }
  
  // 숫자 배열이면 [lng, lat] → [lat, lng] 변환
  if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    return [coords[1], coords[0]]; // [lng, lat] → [lat, lng]
  }
  
  // 중첩 배열이면 재귀적으로 처리
  return coords.map((coord: any) => ensureLatLngOrder(coord));
}

/**
 * 바운딩 박스를 SDK의 fitBounds에 맞는 형태로 변환합니다
 * @param bbox - [minX, minY, maxX, maxY] 바운딩 박스
 * @returns { sw: [lat, lng], ne: [lat, lng] }
 */
export function getBbox(bbox: number[]): { sw: [number, number]; ne: [number, number] } {
  if (!bbox || bbox.length !== 4) {
    throw new Error('유효하지 않은 bbox 형식입니다. [minX, minY, maxX, maxY] 형태여야 합니다.');
  }
  
  const [minX, minY, maxX, maxY] = bbox;
  
  return {
    sw: [minY, minX], // 남서쪽 [lat, lng]
    ne: [maxY, maxX]  // 북동쪽 [lat, lng]
  };
}

/**
 * Feature의 바운딩 박스를 계산합니다
 * @param feature - GeoJSON Feature
 * @returns [minX, minY, maxX, maxY]
 */
export function calculateBbox(feature: Feature): number[] {
  // properties에 bbox가 있으면 우선 사용
  if (feature.properties && feature.properties.bbox) {
    return feature.properties.bbox;
  }
  
  // 없으면 지오메트리에서 계산
  const coords = feature.geometry.coordinates;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  function updateBounds(coord: number[]) {
    const [x, y] = coord;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  
  function processCoords(coordinates: any) {
    if (Array.isArray(coordinates[0])) {
      coordinates.forEach(processCoords);
    } else {
      updateBounds(coordinates);
    }
  }
  
  processCoords(coords);
  
  return [minX, minY, maxX, maxY];
}

/**
 * Feature의 중심점을 계산합니다
 * @param feature - GeoJSON Feature
 * @returns [lng, lat] 중심점
 */
export function getCenter(feature: Feature): [number, number] {
  // properties에 center가 있으면 우선 사용
  if (feature.properties && feature.properties.center) {
    return feature.properties.center;
  }
  
  // 없으면 bbox 중심점 계산
  const bbox = calculateBbox(feature);
  const [minX, minY, maxX, maxY] = bbox;
  
  return [
    (minX + maxX) / 2,
    (minY + maxY) / 2
  ];
}

/**
 * GeoJSON Feature를 카카오맵 Polygon 경로로 변환합니다
 * @param feature - GeoJSON Feature
 * @returns 카카오맵용 경로 배열 (lat, lng 순서)
 */
export function toKakaoPolygonPaths(feature: Feature): number[][][] {
  const geometry = feature.geometry;
  
  if (geometry.type === 'Polygon') {
    // Polygon: [exterior, hole1, hole2, ...]
    return geometry.coordinates.map((ring: number[][]) => 
      ring.map((coord: number[]) => ensureLatLngOrder(coord))
    );
  } else if (geometry.type === 'MultiPolygon') {
    // MultiPolygon: [[exterior, hole1, ...], [exterior2, hole2, ...], ...]
    return geometry.coordinates.flatMap((polygon: number[][][]) =>
      polygon.map((ring: number[][]) => 
        ring.map((coord: number[]) => ensureLatLngOrder(coord))
      )
    );
  }
  
  return [];
}

/**
 * GeoJSON Feature를 네이버맵 Polygon 경로로 변환합니다
 * @param feature - GeoJSON Feature  
 * @returns 네이버맵용 경로 배열 (lat, lng 순서)
 */
export function toNaverPolygonPaths(feature: Feature): number[][][] {
  // 네이버맵도 카카오맵과 동일한 형태
  return toKakaoPolygonPaths(feature);
}

/**
 * 디버그용: Feature의 좌표 샘플을 출력합니다
 * @param feature - GeoJSON Feature
 * @param sampleCount - 샘플 개수 (기본 3개)
 * @returns 샘플 좌표 배열
 */
export function getCoordSamples(feature: Feature, sampleCount: number = 3): number[][] {
  const geometry = feature.geometry;
  
  if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0]; // 외부 링만
    return ring.slice(0, sampleCount);
  } else if (geometry.type === 'MultiPolygon') {
    const ring = geometry.coordinates[0][0]; // 첫 번째 폴리곤의 외부 링
    return ring.slice(0, sampleCount);
  }
  
  return [];
}

/**
 * 에러 메시지 생성
 * @param error - 에러 객체
 * @returns 사용자 친화적 에러 메시지
 */
export function getErrorMessage(error: any): string {
  if (error.message?.includes('401') || error.message?.includes('403')) {
    return '🔑 API 키 인증 실패: 허용 도메인에 http://localhost:5173을 등록해주세요.';
  }
  
  if (error.message?.includes('404')) {
    return '📁 TopoJSON 파일을 찾을 수 없습니다. 경로를 확인해주세요.';
  }
  
  if (error.message?.includes('SyntaxError')) {
    return '📄 TopoJSON 파일 형식이 올바르지 않습니다.';
  }
  
  if (error.message?.includes('객체를 찾을 수 없습니다')) {
    return `🔍 ${error.message}`;
  }
  
  return `❌ 오류: ${error.message || error}`;
}
