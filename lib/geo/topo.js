/**
 * TopoJSON 유틸리티 라이브러리
 * 
 * 지도 컴포넌트에서 사용하는 TopoJSON 로딩, 변환, 계산 함수들
 */

import * as topojson from 'topojson-client';

/**
 * TopoJSON 파일을 동적으로 로드합니다
 * @param {string} url - TopoJSON 파일 URL
 * @returns {Promise<Object>} TopoJSON 객체
 */
export async function loadTopojson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('TopoJSON 로드 실패:', url, error);
    throw error;
  }
}

/**
 * TopoJSON에서 지오메트리 객체를 추출합니다
 * @param {Object} topology - TopoJSON 객체
 * @param {string} objectName - 추출할 객체 이름 ('sig' | 'emd')
 * @returns {Object} GeoJSON FeatureCollection
 */
export function getObjects(topology, objectName) {
  if (!topology.objects || !topology.objects[objectName]) {
    throw new Error(`TopoJSON에서 '${objectName}' 객체를 찾을 수 없습니다`);
  }
  
  return topojson.feature(topology, topology.objects[objectName]);
}

/**
 * GeoJSON Feature의 중심점을 계산합니다
 * @param {Object} feature - GeoJSON Feature
 * @returns {Array} [lng, lat] 좌표
 */
export function centroid(feature) {
  // properties에 center가 있으면 우선 사용
  if (feature.properties && feature.properties.center) {
    return feature.properties.center;
  }
  
  // 없으면 지오메트리에서 계산
  const coords = feature.geometry.coordinates;
  
  if (feature.geometry.type === 'Polygon') {
    return polygonCentroid(coords[0]);
  } else if (feature.geometry.type === 'MultiPolygon') {
    // 가장 큰 폴리곤의 중심점 사용
    let largestArea = 0;
    let largestPolygon = coords[0][0];
    
    coords.forEach(polygon => {
      const area = polygonArea(polygon[0]);
      if (area > largestArea) {
        largestArea = area;
        largestPolygon = polygon[0];
      }
    });
    
    return polygonCentroid(largestPolygon);
  }
  
  return [0, 0]; // 기본값
}

/**
 * 폴리곤의 중심점을 계산합니다 (centroid 알고리즘)
 * @param {Array} coords - 폴리곤 좌표 배열
 * @returns {Array} [lng, lat] 중심점
 */
function polygonCentroid(coords) {
  let x = 0, y = 0, area = 0;
  
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const xi = coords[i][0], yi = coords[i][1];
    const xj = coords[j][0], yj = coords[j][1];
    const a = xi * yj - xj * yi;
    area += a;
    x += (xi + xj) * a;
    y += (yi + yj) * a;
  }
  
  area *= 0.5;
  x /= (6.0 * area);
  y /= (6.0 * area);
  
  return [x, y];
}

/**
 * 폴리곤의 면적을 계산합니다
 * @param {Array} coords - 폴리곤 좌표 배열
 * @returns {number} 면적
 */
function polygonArea(coords) {
  let area = 0;
  
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    area += (coords[j][0] * coords[i][1] - coords[i][0] * coords[j][1]);
  }
  
  return Math.abs(area) / 2.0;
}

/**
 * GeoJSON 좌표를 카카오맵 LatLng 배열로 변환합니다
 * @param {Object} feature - GeoJSON Feature
 * @param {Object} kakao - 카카오맵 API 객체
 * @returns {Array} 카카오맵 LatLng 배열
 */
export function toLatLngPaths(feature, kakao) {
  const coords = feature.geometry.coordinates;
  
  if (feature.geometry.type === 'Polygon') {
    return coords.map(ring => 
      ring.map(coord => new kakao.maps.LatLng(coord[1], coord[0]))
    );
  } else if (feature.geometry.type === 'MultiPolygon') {
    return coords.map(polygon => 
      polygon.map(ring => 
        ring.map(coord => new kakao.maps.LatLng(coord[1], coord[0]))
      )
    ).flat();
  }
  
  return [];
}

/**
 * 바운딩 박스를 카카오맵 LatLngBounds로 변환합니다
 * @param {Array} bbox - [minX, minY, maxX, maxY] 바운딩 박스
 * @param {Object} kakao - 카카오맵 API 객체
 * @returns {Object} 카카오맵 LatLngBounds
 */
export function toBounds(bbox, kakao) {
  const [minX, minY, maxX, maxY] = bbox;
  return new kakao.maps.LatLngBounds(
    new kakao.maps.LatLng(minY, minX),
    new kakao.maps.LatLng(maxY, maxX)
  );
}

/**
 * Feature의 바운딩 박스를 계산합니다
 * @param {Object} feature - GeoJSON Feature
 * @returns {Array} [minX, minY, maxX, maxY] 바운딩 박스
 */
export function getBounds(feature) {
  // properties에 bbox가 있으면 우선 사용
  if (feature.properties && feature.properties.bbox) {
    return feature.properties.bbox;
  }
  
  // 없으면 지오메트리에서 계산
  const coords = feature.geometry.coordinates;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  function updateBounds(coord) {
    const [x, y] = coord;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  
  function processCoords(coordinates) {
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
 * 두 바운딩 박스가 겹치는지 확인합니다
 * @param {Array} bbox1 - 첫 번째 바운딩 박스
 * @param {Array} bbox2 - 두 번째 바운딩 박스
 * @returns {boolean} 겹침 여부
 */
export function bboxIntersects(bbox1, bbox2) {
  const [minX1, minY1, maxX1, maxY1] = bbox1;
  const [minX2, minY2, maxX2, maxY2] = bbox2;
  
  return !(maxX1 < minX2 || maxX2 < minX1 || maxY1 < minY2 || maxY2 < minY1);
}

/**
 * 점이 바운딩 박스 안에 있는지 확인합니다
 * @param {Array} point - [lng, lat] 점 좌표
 * @param {Array} bbox - 바운딩 박스
 * @returns {boolean} 포함 여부
 */
export function pointInBbox(point, bbox) {
  const [lng, lat] = point;
  const [minX, minY, maxX, maxY] = bbox;
  
  return lng >= minX && lng <= maxX && lat >= minY && lat <= maxY;
}

/**
 * 경기도 시·군 TopoJSON을 로드합니다
 * @returns {Promise<Object>} 경기도 시·군 FeatureCollection
 */
export async function loadGyeonggiSig() {
  const topology = await loadTopojson('/geo/gyeonggi/sig.topo.json');
  return getObjects(topology, 'sig');
}

/**
 * 특정 시·군의 읍면동 TopoJSON을 로드합니다
 * @param {string} sigCode - 시·군 코드
 * @returns {Promise<Object>} 읍면동 FeatureCollection
 */
export async function loadGyeonggiEmd(sigCode) {
  const topology = await loadTopojson(`/geo/gyeonggi/emd/${sigCode}.topo.json`);
  return getObjects(topology, 'emd');
}

/**
 * Feature ID로 특정 Feature를 찾습니다
 * @param {Object} featureCollection - GeoJSON FeatureCollection
 * @param {string} id - Feature ID
 * @returns {Object|null} 찾은 Feature 또는 null
 */
export function findFeatureById(featureCollection, id) {
  return featureCollection.features.find(feature => 
    feature.id === id || feature.properties.code === id
  ) || null;
}

/**
 * Feature 이름으로 검색합니다
 * @param {Object} featureCollection - GeoJSON FeatureCollection
 * @param {string} query - 검색어
 * @returns {Array} 검색 결과 Feature 배열
 */
export function searchFeatures(featureCollection, query) {
  const normalizedQuery = query.toLowerCase().trim();
  
  return featureCollection.features.filter(feature => 
    feature.properties.name && 
    feature.properties.name.toLowerCase().includes(normalizedQuery)
  );
}
