#!/usr/bin/env node
import fs from "fs";
import path from "path";

const GYEONGGI_31_REGIONS = [
  // 수원시
  { id: "41110", name: "수원시", x: 200, y: 150, radius: 35, color: "#FFE4E1" },
  
  // 성남시
  { id: "41130", name: "성남시", x: 230, y: 100, radius: 35, color: "#E6F3FF" },
  
  // 의정부시
  { id: "41150", name: "의정부시", x: 100, y: 80, radius: 30, color: "#F0F8FF" },
  
  // 안양시
  { id: "41170", name: "안양시", x: 220, y: 120, radius: 30, color: "#F5F5DC" },
  
  // 부천시
  { id: "41190", name: "부천시", x: 190, y: 140, radius: 30, color: "#FFF8DC" },
  
  // 광명시
  { id: "41210", name: "광명시", x: 150, y: 180, radius: 25, color: "#F0FFF0" },
  
  // 평택시
  { id: "41220", name: "평택시", x: 350, y: 250, radius: 30, color: "#FFF0F5" },
  
  // 동두천시
  { id: "41250", name: "동두천시", x: 80, y: 60, radius: 25, color: "#FDF5E6" },
  
  // 안산시
  { id: "41270", name: "안산시", x: 320, y: 200, radius: 30, color: "#F0F8FF" },
  
  // 고양시
  { id: "41280", name: "고양시", x: 170, y: 40, radius: 35, color: "#F5F5F5" },
  
  // 과천시
  { id: "41290", name: "과천시", x: 220, y: 160, radius: 20, color: "#F8F8FF" },
  
  // 구리시
  { id: "41310", name: "구리시", x: 140, y: 60, radius: 25, color: "#FFFACD" },
  
  // 남양주시
  { id: "41360", name: "남양주시", x: 120, y: 40, radius: 35, color: "#F0FFF0" },
  
  // 오산시
  { id: "41370", name: "오산시", x: 240, y: 180, radius: 25, color: "#FFF5EE" },
  
  // 시흥시
  { id: "41390", name: "시흥시", x: 320, y: 180, radius: 30, color: "#F5F5DC" },
  
  // 군포시
  { id: "41410", name: "군포시", x: 200, y: 100, radius: 25, color: "#F0F8FF" },
  
  // 의왕시
  { id: "41430", name: "의왕시", x: 220, y: 120, radius: 25, color: "#FFF8DC" },
  
  // 하남시
  { id: "41450", name: "하남시", x: 160, y: 80, radius: 30, color: "#F0FFF0" },
  
  // 용인시
  { id: "41460", name: "용인시", x: 340, y: 120, radius: 35, color: "#F5F5DC" },
  
  // 파주시
  { id: "41480", name: "파주시", x: 50, y: 20, radius: 30, color: "#F0F8FF" },
  
  // 이천시
  { id: "41500", name: "이천시", x: 400, y: 80, radius: 30, color: "#FFF8DC" },
  
  // 안성시
  { id: "41550", name: "안성시", x: 380, y: 150, radius: 30, color: "#F0FFF0" },
  
  // 김포시
  { id: "41570", name: "김포시", x: 80, y: 120, radius: 30, color: "#FFF5EE" },
  
  // 화성시
  { id: "41590", name: "화성시", x: 300, y: 220, radius: 35, color: "#F8F8FF" },
  
  // 광주시
  { id: "41610", name: "광주시", x: 280, y: 100, radius: 30, color: "#F0F8FF" },
  
  // 여주시
  { id: "41630", name: "여주시", x: 420, y: 120, radius: 30, color: "#FFF8DC" },
  
  // 양평군
  { id: "41830", name: "양평군", x: 450, y: 80, radius: 30, color: "#F0FFF0" },
  
  // 고양군
  { id: "41800", name: "고양군", x: 100, y: 200, radius: 30, color: "#FFF5EE" },
  
  // 연천군
  { id: "41820", name: "연천군", x: 60, y: 40, radius: 30, color: "#F8F8FF" },
  
  // 포천군
  { id: "41810", name: "포천군", x: 80, y: 20, radius: 30, color: "#F0F8FF" },
  
  // 가평군
  { id: "41840", name: "가평군", x: 120, y: 20, radius: 25, color: "#FFFACD" }
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
        font-size: 12px;
        font-weight: bold;
        fill: #333;
        pointer-events: none;
        text-anchor: middle;
        dominant-baseline: middle;
      }
      .region-text:hover {
        fill: #ff7419;
      }
    </style>
  </defs>
  
  <!-- 배경 -->
  <rect width="100%" height="100%" fill="#f8f9fa"/>
  
  <!-- 경기도 전체 윤곽선 (간단한 사각형) -->
  <rect x="30" y="10" width="${width-60}" height="${height-20}" 
        fill="none" stroke="#333" stroke-width="3" stroke-dasharray="5,5"/>
  
  <!-- 각 시도군 영역 (원형) -->
`;

  GYEONGGI_31_REGIONS.forEach((region, index) => {
    const { id, name, x, y, radius, color } = region;
    svgContent += `  <!-- ${name} -->
  <g id="${id}" class="region" data-name="${name}" data-region-id="${id}">
    <circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" />
    <text x="${x}" y="${y}" class="region-text">${name}</text>
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
