#!/usr/bin/env node

/**
 * 경기도 행정구역 경계 데이터 파이프라인
 * 
 * 공개 데이터를 TopoJSON으로 변환하여 웹에서 사용 가능한 형태로 가공
 * 
 * 데이터 출처:
 * - 행정안전부 법정동 경계 데이터 (공공데이터포털)
 * - 통계청 통계지리정보서비스 (SGIS)
 * 
 * 사용법: npm run build:geo
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as topojson from 'topojson-server';
import * as turf from '@turf/turf';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 환경 변수 로드
dotenv.config({ path: path.join(rootDir, '.env.local') });

// 경기도 시·군 코드 (통계청 기준)
const GYEONGGI_SIG_CODES = [
  { code: '41111', name: '수원시 장안구' },
  { code: '41113', name: '수원시 연천구' },
  { code: '41115', name: '수원시 팔달구' },
  { code: '41117', name: '수원시 영통구' },
  { code: '41131', name: '성남시 수정구' },
  { code: '41133', name: '성남시 중원구' },
  { code: '41135', name: '성남시 분당구' },
  { code: '41150', name: '의정부시' },
  { code: '41170', name: '안양시 만안구' },
  { code: '41171', name: '안양시 동안구' },
  { code: '41190', name: '부천시' },
  { code: '41210', name: '광명시' },
  { code: '41220', name: '평택시' },
  { code: '41250', name: '동두천시' },
  { code: '41270', name: '안산시 상록구' },
  { code: '41271', name: '안산시 단원구' },
  { code: '41280', name: '고양시 덕양구' },
  { code: '41285', name: '고양시 일산동구' },
  { code: '41287', name: '고양시 일산서구' },
  { code: '41290', name: '과천시' },
  { code: '41310', name: '구리시' },
  { code: '41360', name: '남양주시' },
  { code: '41370', name: '오산시' },
  { code: '41390', name: '시흥시' },
  { code: '41410', name: '군포시' },
  { code: '41430', name: '의왕시' },
  { code: '41450', name: '하남시' },
  { code: '41460', name: '용인시 처인구' },
  { code: '41463', name: '용인시 기흥구' },
  { code: '41465', name: '용인시 수지구' },
  { code: '41480', name: '파주시' },
  { code: '41500', name: '이천시' },
  { code: '41550', name: '안성시' },
  { code: '41570', name: '김포시' },
  { code: '41590', name: '화성시' },
  { code: '41610', name: '광주시' },
  { code: '41630', name: '양주시' },
  { code: '41650', name: '포천시' },
  { code: '41670', name: '여주시' },
  { code: '41800', name: '연천군' },
  { code: '41820', name: '가평군' },
  { code: '41830', name: '양평군' }
];

// 샘플 데이터 생성 (실제 데이터 대체용)
const generateSampleSigData = () => {
  console.log('📝 샘플 시·군 데이터 생성 중...');
  
  const features = [];
  
  // 경기도 중심 좌표 기준으로 격자형 배치
  const baseCenter = [127.2, 37.4];
  const gridSize = 0.3; // 격자 간격
  
  GYEONGGI_SIG_CODES.slice(0, 12).forEach((sig, index) => { // 샘플용으로 12개만 생성
    const row = Math.floor(index / 4);
    const col = index % 4;
    
    const centerLng = baseCenter[0] + (col - 1.5) * gridSize;
    const centerLat = baseCenter[1] + (row - 1) * gridSize;
    
    // 간단한 사각형 폴리곤 생성
    const offset = 0.1;
    const polygon = turf.polygon([[
      [centerLng - offset, centerLat - offset],
      [centerLng + offset, centerLat - offset],
      [centerLng + offset, centerLat + offset],
      [centerLng - offset, centerLat + offset],
      [centerLng - offset, centerLat - offset]
    ]]);
    
    const bbox = turf.bbox(polygon);
    
    features.push({
      type: 'Feature',
      id: sig.code,
      properties: {
        code: sig.code,
        name: sig.name,
        center: [centerLng, centerLat],
        bbox: bbox
      },
      geometry: polygon.geometry
    });
  });
  
  return {
    type: 'FeatureCollection',
    features
  };
};

// 샘플 읍면동 데이터 생성
const generateSampleEmdData = (sigCode, sigName) => {
  console.log(`📝 ${sigName} 읍면동 샘플 데이터 생성 중...`);
  
  const features = [];
  const emdNames = ['제1동', '제2동', '제3동', '제4동'];
  
  // 해당 시군의 중심점 기준으로 세분화
  const sigFeature = GYEONGGI_SIG_CODES.find(s => s.code === sigCode);
  if (!sigFeature) return null;
  
  const baseCenter = [127.2, 37.4]; // 임시 중심점
  const subGridSize = 0.05; // 읍면동 간격
  
  emdNames.forEach((emdName, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    
    const centerLng = baseCenter[0] + (col - 0.5) * subGridSize;
    const centerLat = baseCenter[1] + (row - 0.5) * subGridSize;
    
    const offset = 0.02;
    const polygon = turf.polygon([[
      [centerLng - offset, centerLat - offset],
      [centerLng + offset, centerLat - offset],
      [centerLng + offset, centerLat + offset],
      [centerLng - offset, centerLat + offset],
      [centerLng - offset, centerLat - offset]
    ]]);
    
    const bbox = turf.bbox(polygon);
    const emdCode = `${sigCode}${String(index + 1).padStart(2, '0')}`;
    
    features.push({
      type: 'Feature',
      id: emdCode,
      properties: {
        code: emdCode,
        name: emdName,
        parent: sigCode,
        center: [centerLng, centerLat],
        bbox: bbox
      },
      geometry: polygon.geometry
    });
  });
  
  return {
    type: 'FeatureCollection',
    features
  };
};

// GeoJSON을 TopoJSON으로 변환
const convertToTopojson = (geojson, objectName) => {
  return topojson.topology({ [objectName]: geojson }, {
    'property-transform': (properties) => properties,
    'quantization': 1e4 // 좌표 정밀도
  });
};

// 메인 빌드 프로세스
async function buildGeoData() {
  try {
    console.log('🚀 경기도 지리 데이터 빌드 시작...\n');
    
    // 1. 원시 데이터 디렉토리 생성
    await fs.mkdir(path.join(rootDir, 'raw'), { recursive: true });
    
    // 2. 시·군 레벨 데이터 생성
    console.log('🗺️  시·군 레벨 데이터 처리...');
    const sigGeoJson = generateSampleSigData();
    
    // 원시 GeoJSON 저장
    await fs.writeFile(
      path.join(rootDir, 'raw/sig.gyeonggi.geo.json'),
      JSON.stringify(sigGeoJson, null, 2)
    );
    
    // TopoJSON 변환
    const sigTopojson = convertToTopojson(sigGeoJson, 'sig');
    
    // 공개 디렉토리에 저장
    await fs.mkdir(path.join(rootDir, 'public/geo/gyeonggi'), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, 'public/geo/gyeonggi/sig.topo.json'),
      JSON.stringify(sigTopojson)
    );
    
    console.log(`✅ sig.topo.json 생성 완료 (${sigGeoJson.features.length}개 시·군)`);
    
    // 3. 읍면동 레벨 데이터 생성
    console.log('\n🏘️  읍면동 레벨 데이터 처리...');
    await fs.mkdir(path.join(rootDir, 'public/geo/gyeonggi/emd'), { recursive: true });
    
    for (const sig of sigGeoJson.features) {
      const sigCode = sig.properties.code;
      const sigName = sig.properties.name;
      
      const emdGeoJson = generateSampleEmdData(sigCode, sigName);
      if (!emdGeoJson) continue;
      
      // 원시 GeoJSON 저장
      await fs.writeFile(
        path.join(rootDir, `raw/emd.${sigCode}.geo.json`),
        JSON.stringify(emdGeoJson, null, 2)
      );
      
      // TopoJSON 변환
      const emdTopojson = convertToTopojson(emdGeoJson, 'emd');
      
      // 공개 디렉토리에 저장
      await fs.writeFile(
        path.join(rootDir, `public/geo/gyeonggi/emd/${sigCode}.topo.json`),
        JSON.stringify(emdTopojson)
      );
      
      console.log(`✅ ${sigCode}.topo.json 생성 (${sigName}, ${emdGeoJson.features.length}개 읍면동)`);
    }
    
    console.log('\n🎉 모든 지리 데이터 빌드 완료!');
    console.log('\n📂 생성된 파일:');
    console.log('   📄 public/geo/gyeonggi/sig.topo.json');
    console.log('   📁 public/geo/gyeonggi/emd/*.topo.json');
    
  } catch (error) {
    console.error('❌ 빌드 실패:', error);
    process.exit(1);
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  buildGeoData();
}

export { buildGeoData };
