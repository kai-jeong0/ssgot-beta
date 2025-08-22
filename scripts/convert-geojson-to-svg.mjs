import fs from 'fs';
import path from 'path';

// 경기도 시군구 정보
const regionNames = {
    '41111': '수원시 장안구',
    '41113': '수원시 권선구', 
    '41115': '수원시 팔달구',
    '41117': '수원시 영통구',
    '41131': '성남시 수정구',
    '41133': '성남시 중원구',
    '41135': '성남시 분당구',
    '41150': '의정부시',
    '41170': '안양시 만안구',
    '41171': '안양시 동안구',
    '41190': '부천시',
    '41210': '광명시',
    '41220': '평택시',
    '41250': '동두천시',
    '41270': '안산시 상록구',
    '41271': '안산시 단원구',
    '41280': '고양시 덕양구',
    '41281': '고양시 일산동구',
    '41282': '고양시 일산서구',
    '41285': '과천시',
    '41287': '구리시',
    '41290': '남양주시',
    '41310': '오산시',
    '41360': '시흥시',
    '41370': '군포시',
    '41390': '의왕시',
    '41410': '하남시',
    '41430': '용인시 기흥구',
    '41450': '용인시 수지구',
    '41461': '용인시 처인구',
    '41480': '파주시',
    '41500': '이천시',
    '41550': '안성시',
    '41570': '김포시',
    '41590': '화성시',
    '41610': '광주시',
    '41630': '여주시',
    '41650': '양평군',
    '41670': '고양시',
    '41690': '연천군',
    '41730': '포천시',
    '41750': '가평군',
    '41790': '양주시',
    '41800': '동두천시',
    '41810': '연천군',
    '41820': '포천시',
    '41830': '가평군'
};

function convertGeoJSONToSVG(geoJSONPath, outputPath) {
    try {
        // GeoJSON 파일 읽기
        const geoJSONContent = fs.readFileSync(geoJSONPath, 'utf8');
        const geoData = JSON.parse(geoJSONContent);
        
        console.log(`GeoJSON 로드 완료: ${geoData.features.length}개 지역`);
        
        const width = 800;
        const height = 600;
        
        // 경기도 전체 경계 계산
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        geoData.features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates && feature.geometry.coordinates[0]) {
                feature.geometry.coordinates[0].forEach(coord => {
                    minX = Math.min(minX, coord[0]);
                    minY = Math.min(minY, coord[1]);
                    maxX = Math.max(maxX, coord[0]);
                    maxY = Math.max(maxY, coord[1]);
                });
            }
        });
        
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        const scale = Math.min((width - 40) / rangeX, (height - 40) / rangeY);
        const offsetX = (width - rangeX * scale) / 2;
        const offsetY = (height - rangeY * scale) / 2;
        
        let svgContent = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="100%" height="900" viewBox="0 0 ${width} ${height}" stroke-linecap="round" stroke-linejoin="round">
<g id="gyeonggi-regions">`;
        
        geoData.features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates && feature.geometry.coordinates[0]) {
                const id = feature.id;
                const name = regionNames[id] || `지역 ${id}`;
                
                // 좌표 변환
                const coords = feature.geometry.coordinates[0].map(coord => {
                    const x = (coord[0] - minX) * scale + offsetX;
                    const y = (coord[1] - minY) * scale + offsetY;
                    return `${x},${y}`;
                }).join(' ');
                
                svgContent += `
<path id="${id}" d="M ${coords} Z" data-name="${name}" />`;
            }
        });
        
        svgContent += `
</g>
</svg>`;
        
        // SVG 파일 저장
        fs.writeFileSync(outputPath, svgContent, 'utf8');
        console.log(`SVG 파일 생성 완료: ${outputPath}`);
        
        // 생성된 지역 수 확인
        const pathCount = (svgContent.match(/<path/g) || []).length;
        console.log(`생성된 지역 수: ${pathCount}개`);
        
    } catch (error) {
        console.error('변환 중 오류 발생:', error);
    }
}

// 스크립트 실행
const inputPath = path.join(process.cwd(), 'raw', 'sig.gyeonggi.geo.json');
const outputPath = path.join(process.cwd(), 'public', 'gyeonggi.svg');

convertGeoJSONToSVG(inputPath, outputPath);
