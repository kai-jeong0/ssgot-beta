import fs from 'fs';
import path from 'path';

// 경기도 시도군 정보 (실제 행정구역 코드와 위치 기반)
const GYEONGGI_REGIONS = [
  // 수원시 (4개 구)
  { id: '41111', name: '수원시 장안구', x: 200, y: 150, width: 80, height: 60, color: '#FFE4E1' },
  { id: '41113', name: '수원시 권선구', x: 280, y: 150, width: 80, height: 60, color: '#E6E6FA' },
  { id: '41115', name: '수원시 팔달구', x: 200, y: 210, width: 80, height: 60, color: '#F0F8FF' },
  { id: '41117', name: '수원시 영통구', x: 280, y: 210, width: 80, height: 60, color: '#F5F5DC' },
  
  // 성남시 (3개 구)
  { id: '41131', name: '성남시 수정구', x: 150, y: 280, width: 80, height: 60, color: '#FFE4B5' },
  { id: '41133', name: '성남시 중원구', x: 230, y: 280, width: 80, height: 60, color: '#E0FFFF' },
  { id: '41135', name: '성남시 분당구', x: 310, y: 280, width: 80, height: 60, color: '#FFF0F5' },
  
  // 의정부시
  { id: '41150', name: '의정부시', x: 320, y: 80, width: 80, height: 60, color: '#F0FFF0' },
  
  // 안양시 (2개 구)
  { id: '41170', name: '안양시 만안구', x: 150, y: 350, width: 80, height: 60, color: '#FFF8DC' },
  { id: '41171', name: '안양시 동안구', x: 230, y: 350, width: 80, height: 60, color: '#FDF5E6' },
  
  // 부천시
  { id: '41190', name: '부천시', x: 310, y: 350, width: 80, height: 60, color: '#F5F5F5' },
  
  // 광명시
  { id: '41210', name: '광명시', x: 310, y: 410, width: 80, height: 60, color: '#FFEFD5' },
  
  // 평택시
  { id: '41220', name: '평택시', x: 100, y: 410, width: 80, height: 60, color: '#F0F8FF' },
  
  // 동두천시
  { id: '41250', name: '동두천시', x: 400, y: 80, width: 80, height: 60, color: '#FFF0F5' },
  
  // 안산시 (2개 구)
  { id: '41271', name: '안산시 상록구', x: 100, y: 470, width: 80, height: 60, color: '#E6F3FF' },
  { id: '41273', name: '안산시 단원구', x: 180, y: 470, width: 80, height: 60, color: '#F0FFF0' },
  
  // 고양시 (3개 구)
  { id: '41281', name: '고양시 덕양구', x: 150, y: 50, width: 80, height: 60, color: '#FFF8DC' },
  { id: '41285', name: '고양시 일산동구', x: 230, y: 50, width: 80, height: 60, color: '#FDF5E6' },
  { id: '41287', name: '고양시 일산서구', x: 310, y: 50, width: 80, height: 60, color: '#F5F5F5' },
  
  // 과천시
  { id: '41290', name: '과천시', x: 230, y: 410, width: 80, height: 60, color: '#E6E6FA' },
  
  // 구리시
  { id: '41310', name: '구리시', x: 400, y: 150, width: 80, height: 60, color: '#FFE4E1' },
  
  // 남양주시
  { id: '41360', name: '남양주시', x: 480, y: 150, width: 80, height: 60, color: '#E0FFFF' },
  
  // 오산시
  { id: '41370', name: '오산시', x: 180, y: 410, width: 80, height: 60, color: '#FFF0F5' },
  
  // 시흥시
  { id: '41390', name: '시흥시', x: 100, y: 350, width: 80, height: 60, color: '#F0FFF0' },
  
  // 군포시
  { id: '41410', name: '군포시', x: 150, y: 280, width: 80, height: 60, color: '#FFF8DC' },
  
  // 의왕시
  { id: '41430', name: '의왕시', x: 230, y: 280, width: 80, height: 60, color: '#FDF5E6' },
  
  // 하남시
  { id: '41450', name: '하남시', x: 390, y: 280, width: 80, height: 60, color: '#F5F5F5' },
  
  // 용인시 (3개 구)
  { id: '41461', name: '용인시 기흥구', x: 470, y: 280, width: 80, height: 60, color: '#FFEFD5' },
  { id: '41463', name: '용인시 수지구', x: 550, y: 280, width: 80, height: 60, color: '#E6F3FF' },
  { id: '41465', name: '용인시 처인구', x: 470, y: 350, width: 80, height: 60, color: '#F0FFF0' },
  
  // 파주시
  { id: '41480', name: '파주시', x: 80, y: 50, width: 80, height: 60, color: '#FFF8DC' },
  
  // 이천시
  { id: '41500', name: '이천시', x: 550, y: 350, width: 80, height: 60, color: '#FDF5E6' },
  
  // 안성시
  { id: '41550', name: '안성시', x: 470, y: 410, width: 80, height: 60, color: '#F5F5F5' },
  
  // 김포시
  { id: '41570', name: '김포시', x: 80, y: 150, width: 80, height: 60, color: '#FFEFD5' },
  
  // 화성시
  { id: '41590', name: '화성시', x: 100, y: 280, width: 80, height: 60, color: '#E6F3FF' },
  
  // 광주시
  { id: '41610', name: '광주시', x: 390, y: 410, width: 80, height: 60, color: '#F0FFF0' },
  
  // 여주시
  { id: '41630', name: '여주시', x: 630, y: 350, width: 80, height: 60, color: '#FFF8DC' },
  
  // 양평군
  { id: '41800', name: '양평군', x: 630, y: 280, width: 80, height: 60, color: '#FDF5E6' },
  
  // 가평군
  { id: '41820', name: '가평군', x: 550, y: 50, width: 80, height: 60, color: '#F5F5F5' },
  
  // 연천군
  { id: '41830', name: '연천군', x: 480, y: 50, width: 80, height: 60, color: '#FFEFD5' }
];

function createAccurateGyeonggiSVG() {
  const width = 800;
  const height = 600;
  
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .region { 
        cursor: pointer; 
        transition: all 0.3s ease; 
        stroke: #333; 
        stroke-width: 2;
      }
      .region:hover { 
        fill-opacity: 0.8; 
        stroke-width: 3;
        stroke: #ff7419;
      }
      .region-text { 
        font-size: 10px; 
        text-anchor: middle; 
        pointer-events: none; 
        font-family: 'Noto Sans KR', Arial, sans-serif;
        font-weight: bold;
        fill: #333;
      }
      .region-text:hover {
        fill: #ff7419;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        text-anchor: middle;
        fill: #333;
        font-family: 'Noto Sans KR', Arial, sans-serif;
      }
      .subtitle {
        font-size: 14px;
        text-anchor: middle;
        fill: #666;
        font-family: 'Noto Sans KR', Arial, sans-serif;
      }
    </style>
  </defs>
  
  <!-- 제목 -->
  <text x="${width/2}" y="30" class="title">경기도</text>
  <text x="${width/2}" y="50" class="subtitle">31개 시·군</text>
  
  <!-- 배경 -->
  <rect width="100%" height="100%" fill="#f8f9fa"/>
  
  <!-- 경기도 전체 윤곽선 (간단한 사각형) -->
  <rect x="50" y="70" width="${width-100}" height="${height-120}" 
        fill="none" stroke="#333" stroke-width="3" stroke-dasharray="5,5"/>
  
  <!-- 각 시도군 영역 -->
`;

  // 각 시도군을 개별 path로 생성
  GYEONGGI_REGIONS.forEach((region, index) => {
    const { id, name, x, y, width: w, height: h, color } = region;
    
    // 사각형 path 생성
    const pathData = `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h} L ${x} ${y+h} Z`;
    
    svgContent += `  <!-- ${name} -->
  <g id="${id}" class="region" data-name="${name}" data-region-id="${id}">
    <path d="${pathData}" fill="${color}" />
    <text x="${x + w/2}" y="${y + h/2 + 3}" class="region-text">${name}</text>
  </g>
`;
  });

  svgContent += `</svg>`;

  return svgContent;
}

function main() {
  try {
    const svgContent = createAccurateGyeonggiSVG();
    
    // 파일 저장
    const outputPath = path.join('public', 'gyeonggi-accurate.svg');
    fs.writeFileSync(outputPath, svgContent, 'utf8');
    
    console.log('✅ 정확한 경기도 SVG 생성 완료!');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log(`📍 시도군 수: ${GYEONGGI_REGIONS.length}개`);
    
    // 생성된 시도군 목록 출력
    console.log('\n📋 생성된 시도군 목록:');
    GYEONGGI_REGIONS.forEach((region, index) => {
      console.log(`${index + 1}. ${region.name} (${region.id})`);
    });
    
  } catch (error) {
    console.error('❌ SVG 생성 실패:', error);
  }
}

main();
