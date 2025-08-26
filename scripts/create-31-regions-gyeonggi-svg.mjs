#!/usr/bin/env node
import fs from "fs";
import path from "path";

const GYEONGGI_31_REGIONS = [
  // 수원시
  { id: "41110", name: "수원시", x: 400, y: 350, radius: 35, color: "#FFE4E1" },
  
  // 성남시
  { id: "41130", name: "성남시", x: 430, y: 300, radius: 35, color: "#E6F3FF" },
  
  // 의정부시
  { id: "41150", name: "의정부시", x: 300, y: 280, radius: 30, color: "#F0F8FF" },
  
  // 안양시
  { id: "41170", name: "안양시", x: 420, y: 320, radius: 30, color: "#F5F5DC" },
  
  // 부천시
  { id: "41190", name: "부천시", x: 390, y: 340, radius: 30, color: "#FFF8DC" },
  
  // 광명시
  { id: "41210", name: "광명시", x: 350, y: 380, radius: 25, color: "#F0FFF0" },
  
  // 평택시
  { id: "41220", name: "평택시", x: 550, y: 450, radius: 30, color: "#FFF0F5" },
  
  // 동두천시
  { id: "41250", name: "동두천시", x: 280, y: 260, radius: 25, color: "#FDF5E6" },
  
  // 안산시
  { id: "41270", name: "안산시", x: 520, y: 400, radius: 30, color: "#F0F8FF" },
  
  // 고양시
  { id: "41280", name: "고양시", x: 370, y: 240, radius: 35, color: "#F5F5F5" },
  
  // 과천시
  { id: "41290", name: "과천시", x: 420, y: 360, radius: 20, color: "#F8F8FF" },
  
  // 구리시
  { id: "41310", name: "구리시", x: 340, y: 260, radius: 25, color: "#FFFACD" },
  
  // 남양주시
  { id: "41360", name: "남양주시", x: 320, y: 240, radius: 35, color: "#F0FFF0" },
  
  // 오산시
  { id: "41370", name: "오산시", x: 440, y: 380, radius: 25, color: "#FFF5EE" },
  
  // 시흥시
  { id: "41390", name: "시흥시", x: 520, y: 380, radius: 30, color: "#F5F5DC" },
  
  // 군포시
  { id: "41410", name: "군포시", x: 400, y: 300, radius: 25, color: "#F0F8FF" },
  
  // 의왕시
  { id: "41430", name: "의왕시", x: 420, y: 320, radius: 25, color: "#FFF8DC" },
  
  // 하남시
  { id: "41450", name: "하남시", x: 360, y: 280, radius: 30, color: "#F0FFF0" },
  
  // 용인시
  { id: "41460", name: "용인시", x: 540, y: 320, radius: 35, color: "#F5F5DC" },
  
  // 파주시
  { id: "41480", name: "파주시", x: 250, y: 220, radius: 30, color: "#F0F8FF" },
  
  // 이천시
  { id: "41500", name: "이천시", x: 600, y: 280, radius: 30, color: "#FFF8DC" },
  
  // 안성시
  { id: "41550", name: "안성시", x: 580, y: 350, radius: 30, color: "#F0FFF0" },
  
  // 김포시
  { id: "41570", name: "김포시", x: 280, y: 320, radius: 30, color: "#FFF5EE" },
  
  // 화성시
  { id: "41590", name: "화성시", x: 500, y: 420, radius: 35, color: "#F8F8FF" },
  
  // 광주시
  { id: "41610", name: "광주시", x: 480, y: 300, radius: 30, color: "#F0F8FF" },
  
  // 여주시
  { id: "41630", name: "여주시", x: 620, y: 320, radius: 30, color: "#FFF8DC" },
  
  // 양평군
  { id: "41830", name: "양평군", x: 650, y: 280, radius: 30, color: "#F0FFF0" },
  
  // 고양군
  { id: "41800", name: "고양군", x: 300, y: 400, radius: 30, color: "#FFF5EE" },
  
  // 연천군
  { id: "41820", name: "연천군", x: 260, y: 240, radius: 30, color: "#F8F8FF" },
  
  // 포천군
  { id: "41810", name: "포천군", x: 280, y: 220, radius: 30, color: "#F0F8FF" },
  
  // 가평군
  { id: "41840", name: "가평군", x: 320, y: 220, radius: 25, color: "#FFFACD" }
];

console.log("Total regions:", GYEONGGI_31_REGIONS.length);

function create31RegionsGyeonggiSVG() {
  const width = 800;
  const height = 600;
  
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="200 150 500 350" xmlns="http://www.w3.org/2000/svg">
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
    </style>
  </defs>
  
  <!-- 배경 -->
  <rect x="200" y="150" width="500" height="350" fill="#f8f9fa"/>
  
  <!-- 경기도 행정경계선 (2pt 선) -->
  <path d="M 250,180 Q 300,170 350,180 Q 400,190 450,200 Q 500,210 550,220 Q 600,230 650,240 L 670,270 Q 680,300 670,330 Q 660,360 650,390 Q 640,420 630,450 L 600,470 Q 550,480 500,490 Q 450,500 400,510 Q 350,520 300,530 Q 250,540 200,550 L 150,530 Q 100,520 50,510 Q 30,460 50,410 L 60,360 Q 70,310 80,260 L 90,210 Q 110,160 130,130 Q 150,100 170,90 Q 180,95 190,100 Q 200,105 210,110 Q 220,115 230,120 Q 240,125 250,180 Z" 
        fill="none" stroke="#333" stroke-width="2"/>
  
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
