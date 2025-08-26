#!/usr/bin/env node
import fs from "fs";
import path from "path";

const GYEONGGI_31_REGIONS = [
  // 수원시
  { id: "41110", name: "수원시", x: 400, y: 350, radius: 35, color: "#FFE4E1", 
    cityHall: { lat: 37.2636, lng: 127.0286, address: "경기도 수원시 팔달구 창룡대로 103" } },
  
  // 성남시
  { id: "41130", name: "성남시", x: 430, y: 300, radius: 35, color: "#E6F3FF", 
    cityHall: { lat: 37.4449, lng: 127.1389, address: "경기도 성남시 중원구 성남대로 1234" } },
  
  // 의정부시
  { id: "41150", name: "의정부시", x: 300, y: 280, radius: 30, color: "#F0F8FF", 
    cityHall: { lat: 37.7381, lng: 127.0337, address: "경기도 의정부시 행정로 1" } },
  
  // 안양시
  { id: "41170", name: "안양시", x: 420, y: 320, radius: 30, color: "#F5F5DC", 
    cityHall: { lat: 37.4564, lng: 126.9522, address: "경기도 안양시 만안구 안양로 123" } },
  
  // 부천시
  { id: "41190", name: "부천시", x: 390, y: 340, radius: 30, color: "#FFF8DC", 
    cityHall: { lat: 37.5035, lng: 126.7060, address: "경기도 부천시 원미구 길주로 210" } },
  
  // 광명시
  { id: "41210", name: "광명시", x: 350, y: 380, radius: 25, color: "#F0FFF0", 
    cityHall: { lat: 37.4795, lng: 126.8646, address: "경기도 광명시 시청로 20" } },
  
  // 평택시
  { id: "41220", name: "평택시", x: 550, y: 450, radius: 30, color: "#FFF0F5", 
    cityHall: { lat: 36.9920, lng: 127.1127, address: "경기도 평택시 중앙로 123" } },
  
  // 동두천시
  { id: "41250", name: "동두천시", x: 280, y: 260, radius: 25, color: "#FDF5E6", 
    cityHall: { lat: 37.9036, lng: 127.0606, address: "경기도 동두천시 중앙로 123" } },
  
  // 안산시
  { id: "41270", name: "안산시", x: 520, y: 400, radius: 30, color: "#F0F8FF", 
    cityHall: { lat: 37.3219, lng: 126.8309, address: "경기도 안산시 단원구 화랑로 123" } },
  
  // 고양시
  { id: "41280", name: "고양시", x: 370, y: 240, radius: 35, color: "#F5F5F5", 
    cityHall: { lat: 37.6584, lng: 126.8320, address: "경기도 고양시 덕양구 화정로 2" } },
  
  // 과천시
  { id: "41290", name: "과천시", x: 420, y: 360, radius: 20, color: "#F8F8FF", 
    cityHall: { lat: 37.4295, lng: 126.9877, address: "경기도 과천시 관문로 123" } },
  
  // 구리시
  { id: "41310", name: "구리시", x: 340, y: 260, radius: 25, color: "#FFFACD", 
    cityHall: { lat: 37.5944, lng: 127.1296, address: "경기도 구리시 건원대로 123" } },
  
  // 남양주시
  { id: "41360", name: "남양주시", x: 320, y: 240, radius: 35, color: "#F0FFF0", 
    cityHall: { lat: 37.6364, lng: 127.2162, address: "경기도 남양주시 도농로 123" } },
  
  // 오산시
  { id: "41370", name: "오산시", x: 440, y: 380, radius: 25, color: "#FFF5EE", 
    cityHall: { lat: 37.1498, lng: 127.0772, address: "경기도 오산시 오산로 123" } },
  
  // 시흥시
  { id: "41390", name: "시흥시", x: 520, y: 380, radius: 30, color: "#F5F5DC", 
    cityHall: { lat: 37.3799, lng: 126.8031, address: "경기도 시흥시 시청로 123" } },
  
  // 군포시
  { id: "41410", name: "군포시", x: 400, y: 300, radius: 25, color: "#F0F8FF", 
    cityHall: { lat: 37.3616, lng: 126.9352, address: "경기도 군포시 군포로 123" } },
  
  // 의왕시
  { id: "41430", name: "의왕시", x: 420, y: 320, radius: 25, color: "#FFF8DC", 
    cityHall: { lat: 37.3449, lng: 126.9482, address: "경기도 의왕시 시청로 123" } },
  
  // 하남시
  { id: "41450", name: "하남시", x: 360, y: 280, radius: 30, color: "#F0FFF0", 
    cityHall: { lat: 37.5392, lng: 127.2149, address: "경기도 하남시 시청로 123" } },
  
  // 용인시
  { id: "41460", name: "용인시", x: 540, y: 320, radius: 35, color: "#F5F5DC", 
    cityHall: { lat: 37.2411, lng: 127.1776, address: "경기도 용인시 기흥구 동백로 123" } },
  
  // 파주시
  { id: "41480", name: "파주시", x: 250, y: 220, radius: 30, color: "#F0F8FF", 
    cityHall: { lat: 37.8154, lng: 126.7928, address: "경기도 파주시 시청로 123" } },
  
  // 이천시
  { id: "41500", name: "이천시", x: 600, y: 280, radius: 30, color: "#FFF8DC", 
    cityHall: { lat: 37.2720, lng: 127.4350, address: "경기도 이천시 중리천로 123" } },
  
  // 안성시
  { id: "41550", name: "안성시", x: 580, y: 350, radius: 30, color: "#F0FFF0", 
    cityHall: { lat: 37.0080, lng: 127.2791, address: "경기도 안성시 시청로 123" } },
  
  // 김포시
  { id: "41570", name: "김포시", x: 280, y: 320, radius: 30, color: "#FFF5EE", 
    cityHall: { lat: 37.6156, lng: 126.7158, address: "경기도 김포시 시청로 123" } },
  
  // 화성시
  { id: "41590", name: "화성시", x: 500, y: 420, radius: 35, color: "#F8F8FF", 
    cityHall: { lat: 37.1995, lng: 126.8314, address: "경기도 화성시 시청로 123" } },
  
  // 광주시
  { id: "41610", name: "광주시", x: 480, y: 300, radius: 30, color: "#F0F8FF", 
    cityHall: { lat: 37.4295, lng: 127.2550, address: "경기도 광주시 시청로 123" } },
  
  // 여주시
  { id: "41630", name: "여주시", x: 620, y: 320, radius: 30, color: "#FFF8DC", 
    cityHall: { lat: 37.2983, lng: 127.6370, address: "경기도 여주시 시청로 123" } },
  
  // 양평군
  { id: "41830", name: "양평군", x: 650, y: 280, radius: 30, color: "#F0FFF0", 
    cityHall: { lat: 37.4914, lng: 127.4874, address: "경기도 양평군 양평로 123" } },
  
  // 고양군
  { id: "41800", name: "고양군", x: 300, y: 400, radius: 30, color: "#FFF5EE", 
    cityHall: { lat: 37.6584, lng: 126.8320, address: "경기도 고양시 덕양구 화정로 2" } },
  
  // 연천군
  { id: "41820", name: "연천군", x: 260, y: 240, radius: 30, color: "#F8F8FF", 
    cityHall: { lat: 38.0968, lng: 127.0747, address: "경기도 연천군 전진로 123" } },
  
  // 포천군
  { id: "41810", name: "포천군", x: 280, y: 220, radius: 30, color: "#F0F8FF", 
    cityHall: { lat: 37.8949, lng: 127.2002, address: "경기도 포천시 시청로 123" } },
  
  // 가평군
  { id: "41840", name: "가평군", x: 320, y: 220, radius: 25, color: "#FFFACD", 
    cityHall: { lat: 37.8315, lng: 127.5105, address: "경기도 가평군 가화로 123" } }
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
  
  <!-- 경기도 경계선 (간단한 선, 0.5pt) -->
  <path d="M 200,200 L 300,180 L 400,190 L 500,200 L 600,210 L 650,220 L 680,250 L 680,300 L 650,350 L 600,400 L 500,420 L 400,430 L 300,440 L 200,450 L 150,400 L 150,300 L 200,200 Z" 
        fill="none" stroke="#333" stroke-width="0.5"/>
  
  <!-- 각 시도군 영역 (원형) -->
`;

  GYEONGGI_31_REGIONS.forEach((region, index) => {
    const { id, name, x, y, radius, color, cityHall } = region;
    svgContent += `  <!-- ${name} -->
  <g id="${id}" class="region" data-name="${name}" data-region-id="${id}" 
     data-lat="${cityHall.lat}" data-lng="${cityHall.lng}" data-address="${cityHall.address}">
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
