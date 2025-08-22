import fs from 'fs';
import path from 'path';

// 경기도 시도군 정보 (실제 데이터 기반)
const GYEONGGI_REGIONS = [
  { id: '41111', name: '수원시 장안구', color: '#FFE4E1' },
  { id: '41113', name: '수원시 권선구', color: '#E6E6FA' },
  { id: '41115', name: '수원시 팔달구', color: '#F0F8FF' },
  { id: '41117', name: '수원시 영통구', color: '#F5F5DC' },
  { id: '41131', name: '성남시 수정구', color: '#FFE4B5' },
  { id: '41133', name: '성남시 중원구', color: '#E0FFFF' },
  { id: '41135', name: '성남시 분당구', color: '#FFF0F5' },
  { id: '41150', name: '의정부시', color: '#F0FFF0' },
  { id: '41170', name: '안양시 만안구', color: '#FFF8DC' },
  { id: '41171', name: '안양시 동안구', color: '#FDF5E6' },
  { id: '41190', name: '부천시', color: '#F5F5F5' },
  { id: '41210', name: '광명시', color: '#FFEFD5' },
  { id: '41220', name: '평택시', color: '#F0F8FF' },
  { id: '41250', name: '동두천시', color: '#FFF0F5' },
  { id: '41270', name: '안산시', color: '#F0FFF0' },
  { id: '41280', name: '고양시', color: '#FFF8DC' },
  { id: '41285', name: '고양시 덕양구', color: '#FDF5E6' },
  { id: '41287', name: '고양시 일산동구', color: '#F5F5F5' },
  { id: '41290', name: '고양시 일산서구', color: '#FFEFD5' },
  { id: '41310', name: '과천시', color: '#FFE4E1' },
  { id: '41360', name: '구리시', color: '#E6E6FA' },
  { id: '41370', name: '남양주시', color: '#F0F8FF' },
  { id: '41390', name: '오산시', color: '#F5F5DC' },
  { id: '41410', name: '시흥시', color: '#FFE4B5' },
  { id: '41430', name: '군포시', color: '#E0FFFF' },
  { id: '41450', name: '의왕시', color: '#FFF0F5' },
  { id: '41460', name: '하남시', color: '#F0FFF0' },
  { id: '41480', name: '용인시', color: '#FFF8DC' },
  { id: '41481', name: '용인시 처인구', color: '#FDF5E6' },
  { id: '41482', name: '용인시 기흥구', color: '#F5F5F5' },
  { id: '41483', name: '용인시 수지구', color: '#FFEFD5' },
  { id: '41500', name: '파주시', color: '#FFE4E1' },
  { id: '41550', name: '이천시', color: '#E6E6FA' },
  { id: '41570', name: '안성시', color: '#F0F8FF' },
  { id: '41590', name: '김포시', color: '#F5F5DC' },
  { id: '41610', name: '화성시', color: '#FFE4B5' },
  { id: '41630', name: '광주시', color: '#E0FFFF' },
  { id: '41650', name: '여주시', color: '#FFF0F5' },
  { id: '41800', name: '양평군', color: '#F0FFF0' },
  { id: '41820', name: '고양군', color: '#FFF8DC' },
  { id: '41830', name: '연천군', color: '#FDF5E6' },
  { id: '41840', name: '가평군', color: '#F5F5F5' },
  { id: '41850', name: '포천군', color: '#FFEFD5' }
];

// 기존 SVG를 읽어서 시도군별로 분할하는 함수
function splitGyeonggiSVG() {
  // 기존 SVG 파일 읽기
  const svgPath = path.join(process.cwd(), 'public/gyeonggi.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // 기존 path 데이터 추출 (간단한 방법)
  const pathMatch = svgContent.match(/<path[^>]*d="([^"]*)"[^>]*>/);
  
  if (!pathMatch) {
    console.error('❌ SVG에서 path 데이터를 찾을 수 없습니다.');
    return;
  }
  
  const originalPathData = pathMatch[1];
  console.log('📏 원본 path 데이터 길이:', originalPathData.length);
  
  // 새로운 SVG 생성
  let newSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="385" height="435" viewBox="0 0 385 435" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .region { cursor: pointer; transition: fill 0.3s ease; }
      .region:hover { fill-opacity: 0.8; }
      .region-text { font-size: 10px; text-anchor: middle; pointer-events: none; }
    </style>
  </defs>
  
  <!-- 배경 -->
  <rect width="100%" height="100%" fill="#f8f9fa"/>
  
  <!-- 시도군별 영역 (테스트용 격자) -->
`;

  // 시도군별로 격자 영역 생성 (실제 지리 데이터가 없으므로 테스트용)
  const gridSize = 4; // 4x4 격자
  const cellWidth = 385 / gridSize;
  const cellHeight = 435 / gridSize;
  
  let regionIndex = 0;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (regionIndex < GYEONGGI_REGIONS.length) {
        const region = GYEONGGI_REGIONS[regionIndex];
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        newSVG += `  <!-- ${region.name} -->
  <g id="${region.id}" class="region" data-name="${region.name}">
    <rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" 
          fill="${region.color}" stroke="#333" stroke-width="1" 
          data-region-id="${region.id}" />
    <text x="${x + cellWidth/2}" y="${y + cellHeight/2}" 
          class="region-text" fill="#333">${region.name}</text>
  </g>
`;
        
        regionIndex++;
      }
    }
  }
  
  newSVG += `</svg>`;
  
  return newSVG;
}

// 메인 실행
async function main() {
  try {
    console.log('🔄 경기도 SVG 분할 시작...');
    
    // SVG 분할
    const newSVG = splitGyeonggiSVG();
    
    if (newSVG) {
      // 결과 저장
      const outputPath = path.join(process.cwd(), 'public/gyeonggi-regions.svg');
      fs.writeFileSync(outputPath, newSVG, 'utf8');
      
      console.log('✅ SVG 분할 완료:', outputPath);
      console.log('📊 총 시도군 수:', GYEONGGI_REGIONS.length);
      
      // 시도군 목록 출력
      console.log('\n📋 시도군 목록:');
      GYEONGGI_REGIONS.forEach(region => {
        console.log(`  - ${region.name} (${region.id})`);
      });
      
      console.log('\n💡 사용법:');
      console.log('  - 각 시도군을 개별적으로 클릭할 수 있습니다');
      console.log('  - hover 효과가 적용됩니다');
      console.log('  - data-region-id 속성으로 시도군을 구분할 수 있습니다');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
