#!/usr/bin/env node
import fs from "fs";
import path from "path";

const GYEONGGI_31_REGIONS = [
  // 수원시 (4개 구)
  { id: "41111", name: "수원시 장안구", x: 200, y: 150, width: 80, height: 60, color: "#FFE4E1" },
  { id: "41113", name: "수원시 권선구", x: 290, y: 150, width: 80, height: 60, color: "#FFE4E1" },
  { id: "41115", name: "수원시 팔달구", x: 200, y: 220, width: 80, height: 60, color: "#FFE4E1" },
  { id: "41117", name: "수원시 영통구", x: 290, y: 220, width: 80, height: 60, color: "#FFE4E1" },
  
  // 성남시 (3개 구)
  { id: "41131", name: "성남시 수정구", x: 150, y: 100, width: 70, height: 50, color: "#E6F3FF" },
  { id: "41133", name: "성남시 중원구", x: 230, y: 100, width: 70, height: 50, color: "#E6F3FF" },
  { id: "41135", name: "성남시 분당구", x: 310, y: 100, width: 70, height: 50, color: "#E6F3FF" },
  
  // 의정부시
  { id: "41150", name: "의정부시", x: 100, y: 80, width: 60, height: 40, color: "#F0F8FF" },
  
  // 안양시 (2개 구)
  { id: "41171", name: "안양시 만안구", x: 180, y: 120, width: 65, height: 45, color: "#F5F5DC" },
  { id: "41173", name: "안양시 동안구", x: 255, y: 120, width: 65, height: 45, color: "#F5F5DC" },
  
  // 부천시 (3개 구)
  { id: "41190", name: "부천시 원미구", x: 120, y: 140, width: 60, height: 40, color: "#FFF8DC" },
  { id: "41192", name: "부천시 소사구", x: 190, y: 140, width: 60, height: 40, color: "#FFF8DC" },
  { id: "41194", name: "부천시 오정구", x: 260, y: 140, width: 60, height: 40, color: "#FFF8DC" },
  
  // 광명시
  { id: "41210", name: "광명시", x: 150, y: 180, width: 55, height: 35, color: "#F0FFF0" },
  
  // 평택시
  { id: "41220", name: "평택시", x: 350, y: 250, width: 70, height: 50, color: "#FFF0F5" },
  
  // 동두천시
  { id: "41250", name: "동두천시", x: 80, y: 60, width: 50, height: 30, color: "#FDF5E6" },
  
  // 안산시 (2개 구)
  { id: "41271", name: "안산시 상록구", x: 280, y: 200, width: 65, height: 45, color: "#F0F8FF" },
  { id: "41273", name: "안산시 단원구", x: 355, y: 200, width: 65, height: 45, color: "#F0F8FF" },
  
  // 고양시 (3개 구)
  { id: "41281", name: "고양시 덕양구", x: 90, y: 40, width: 70, height: 50, color: "#F5F5F5" },
  { id: "41285", name: "고양시 일산동구", x: 170, y: 40, width: 70, height: 50, color: "#F5F5F5" },
  { id: "41287", name: "고양시 일산서구", x: 250, y: 40, width: 70, height: 50, color: "#F5F5F5" },
  
  // 과천시
  { id: "41290", name: "과천시", x: 220, y: 160, width: 45, height: 30, color: "#F8F8FF" },
  
  // 구리시
  { id: "41310", name: "구리시", x: 140, y: 60, width: 55, height: 35, color: "#FFFACD" },
  
  // 남양주시
  { id: "41360", name: "남양주시", x: 120, y: 40, width: 80, height: 60, color: "#F0FFF0" },
  
  // 오산시
  { id: "41370", name: "오산시", x: 240, y: 180, width: 50, height: 35, color: "#FFF5EE" },
  
  // 시흥시
  { id: "41390", name: "시흥시", x: 320, y: 180, width: 60, height: 40, color: "#F5F5DC" },
  
  // 군포시
  { id: "41410", name: "군포시", x: 200, y: 100, width: 55, height: 35, color: "#F0F8FF" },
  
  // 의왕시
  { id: "41430", name: "의왕시", x: 220, y: 120, width: 50, height: 30, color: "#FFF8DC" },
  
  // 하남시
  { id: "41450", name: "하남시", x: 160, y: 80, width: 60, height: 40, color: "#F0FFF0" },
  
  // 용인시 (2개 구)
  { id: "41461", name: "용인시 처인구", x: 300, y: 120, width: 70, height: 50, color: "#F5F5DC" },
  { id: "41463", name: "용인시 기흥구", x: 380, y: 120, width: 70, height: 50, color: "#F5F5DC" }
];

console.log("Total regions:", GYEONGGI_31_REGIONS.length);

function create31RegionsGyeonggiSVG() {
  const width = 800;
  const height = 600;
  
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .region {
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .region:hover {
        filter: brightness(1.1);
        stroke-width: 3;
        stroke: #ff7419;
      }
      .region-text {
        font-size: 11px;
        font-weight: bold;
        fill: #333;
        pointer-events: none;
        text-anchor: middle;
        dominant-baseline: middle;
      }
      .region-text:hover {
        fill: #ff7419;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        fill: #333;
        text-anchor: middle;
      }
      .subtitle {
        font-size: 16px;
        fill: #666;
        text-anchor: middle;
      }
    </style>
  </defs>
  
  <!-- 제목 -->
  <text x="${width/2}" y="30" class="title">경기도</text>
  <text x="${width/2}" y="50" class="subtitle">31개 시도군</text>
  
  <!-- 배경 -->
  <rect width="100%" height="100%" fill="#f8f9fa"/>
  
  <!-- 경기도 전체 윤곽선 (간단한 사각형) -->
  <rect x="50" y="70" width="${width-100}" height="${height-120}" 
        fill="none" stroke="#333" stroke-width="3" stroke-dasharray="5,5"/>
  
  <!-- 각 시도군 영역 -->
`;

  GYEONGGI_31_REGIONS.forEach((region, index) => {
    const { id, name, x, y, width: w, height: h, color } = region;
    svgContent += `  <!-- ${name} -->
  <g id="${id}" class="region" data-name="${name}" data-region-id="${id}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" />
    <text x="${x + w/2}" y="${y + h/2}" class="region-text">${name}</text>
  </g>
`;
  });

  svgContent += `</svg>`;
  return svgContent;
}

// 메인 함수
function main() {
  try {
    const svgContent = create31RegionsGyeonggiSVG();
    const outputPath = path.join(process.cwd(), 'public/gyeonggi-31-regions.svg');
    
    fs.writeFileSync(outputPath, svgContent, 'utf8');
    console.log(`✅ 31개 시도군 SVG 생성 완료: ${outputPath}`);
    console.log(`📊 총 ${GYEONGGI_31_REGIONS.length}개 시도군 포함`);
  } catch (error) {
    console.error('❌ SVG 생성 실패:', error);
    process.exit(1);
  }
}

main();
