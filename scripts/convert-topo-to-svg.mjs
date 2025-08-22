import fs from 'fs';
import path from 'path';

// TopoJSON을 SVG로 변환하는 함수
function topoToSVG(topoData, width = 385, height = 435) {
  const { objects, arcs, bbox } = topoData;
  const sig = objects.sig;
  
  let svgPaths = '';
  let svgGroups = '';
  
  // 각 시도군별로 path 생성
  sig.geometries.forEach((geometry, index) => {
    const { id, properties } = geometry;
    const { name } = properties;
    
    // arc 인덱스로 실제 좌표 계산
    const arc = arcs[geometry.arcs[0]];
    if (arc && arc.length > 0) {
      // TopoJSON 좌표를 SVG 좌표로 변환
      const points = arc.map((point, i) => {
        if (i === 0) {
          return `M ${point[0]},${point[1]}`;
        }
        return `L ${point[0]},${point[1]}`;
      }).join(' ');
      
      // Z로 path 닫기
      const pathData = points + ' Z';
      
      // 개별 path 생성
      svgPaths += `<path id="${id}" d="${pathData}" fill="none" stroke="black" stroke-width="0.5" data-name="${name}" />\n`;
      
      // 그룹으로도 생성 (선택적)
      svgGroups += `<g id="group-${id}" data-name="${name}">\n`;
      svgGroups += `  <path d="${pathData}" fill="none" stroke="black" stroke-width="0.5" />\n`;
      svgGroups += `  <text x="${properties.center[0]}" y="${properties.center[1]}" text-anchor="middle" font-size="8">${name}</text>\n`;
      svgGroups += `</g>\n`;
    }
  });
  
  // SVG 템플릿
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="${bbox.join(' ')}" xmlns="http://www.w3.org/2000/svg">
  <!-- 개별 시도군 path들 -->
  ${svgPaths}
  
  <!-- 시도군 그룹들 (텍스트 포함) -->
  ${svgGroups}
</svg>`;
  
  return svg;
}

// 메인 실행
async function main() {
  try {
    // TopoJSON 파일 읽기
    const topoPath = path.join(process.cwd(), 'public/geo/gyeonggi/sig.topo.json');
    const topoData = JSON.parse(fs.readFileSync(topoPath, 'utf8'));
    
    // SVG로 변환
    const svg = topoToSVG(topoData);
    
    // 결과 저장
    const outputPath = path.join(process.cwd(), 'public/gyeonggi-separated.svg');
    fs.writeFileSync(outputPath, svg, 'utf8');
    
    console.log('✅ SVG 변환 완료:', outputPath);
    console.log('📊 총 시도군 수:', topoData.objects.sig.geometries.length);
    
    // 시도군 목록 출력
    console.log('\n📋 시도군 목록:');
    topoData.objects.sig.geometries.forEach(geo => {
      console.log(`  - ${geo.properties.name} (${geo.id})`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
