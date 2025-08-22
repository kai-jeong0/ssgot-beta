import React, { useState, useEffect } from 'react';

// SVG 지역 스타일을 위한 CSS
const svgStyles = `
  .region-path {
    transition: all 0.3s ease;
  }
  
  .region-path:hover {
    fill: #FF7419 !important;
    stroke: #EA580C !important;
    stroke-width: 2 !important;
    filter: drop-shadow(0 4px 8px rgba(255, 116, 25, 0.3)) !important;
  }
  
  .region-path.selected {
    fill: #FF7419 !important;
    stroke: #EA580C !important;
    stroke-width: 2.5 !important;
    filter: drop-shadow(0 6px 12px rgba(255, 116, 25, 0.4)) !important;
  }
`;

const RegionGrid = ({ onCitySelect }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [regions, setRegions] = useState([]);

  // 경기도 시군구 정보 (코드와 이름 매핑)
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
    '41463': '용인시 처인구',
    '41465': '용인시 처인구',
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

  useEffect(() => {
    // SVG 파일 로드
    fetch('/gyeonggi.svg')
      .then(response => response.text())
      .then(svgText => {
        setSvgContent(svgText);
        
        // SVG에서 지역 정보 추출
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const paths = svgDoc.querySelectorAll('path[id]');
        
        const extractedRegions = Array.from(paths).map(path => {
          const id = path.getAttribute('id');
          const name = regionNames[id] || `지역 ${id}`;
          return { id, name, element: path };
        });
        
        setRegions(extractedRegions);
      })
      .catch(error => {
        console.error('SVG 로드 실패:', error);
      });
  }, []);

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
    onCitySelect(region.name);
  };

  const handleRegionHover = (region) => {
    if (selectedRegion?.id !== region.id) {
      setHoveredRegion(region);
    }
  };

  const handleRegionLeave = () => {
    setHoveredRegion(null);
  };

  // SVG 내용을 dangerouslySetInnerHTML로 렌더링하고 이벤트 핸들러 추가
  const renderSvgWithInteractivity = () => {
    if (!svgContent) return null;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    
    if (!svgElement) return null;

    // SVG 크기 조정
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', 'auto');
    svgElement.setAttribute('viewBox', '0 0 800 437');
    
    // 각 지역에 이벤트 핸들러 추가
    regions.forEach(region => {
      const path = svgElement.querySelector(`#${region.id}`);
      if (path) {
        // 기본 스타일 설정
        path.style.cursor = 'pointer';
        path.style.transition = 'all 0.3s ease';
        
        // 선택된 지역인지 확인하여 스타일 적용
        if (selectedRegion?.id === region.id) {
          path.style.fill = '#FF7419';
          path.style.stroke = '#EA580C';
          path.style.strokeWidth = '2.5';
          path.style.filter = 'drop-shadow(0 6px 12px rgba(255, 116, 25, 0.4))';
          path.classList.add('selected');
        } else {
          path.style.fill = '#F3F4F6';
          path.style.stroke = '#D1D5DB';
          path.style.strokeWidth = '1.5';
          path.style.filter = 'none';
          path.classList.remove('selected');
        }
        
        // 호버 효과를 위한 CSS 클래스 추가
        path.classList.add('region-path');
        
        // 클릭 이벤트
        path.onclick = () => handleRegionClick(region);
        
        // 호버 이벤트 (선택되지 않은 지역만)
        if (selectedRegion?.id !== region.id) {
          path.onmouseenter = () => {
            path.style.fill = '#FF7419';
            path.style.stroke = '#EA580C';
            path.style.strokeWidth = '2';
            path.style.filter = 'drop-shadow(0 4px 8px rgba(255, 116, 25, 0.3))';
            handleRegionHover(region);
          };
          
          path.onmouseleave = () => {
            path.style.fill = '#F3F4F6';
            path.style.stroke = '#D1D5DB';
            path.style.strokeWidth = '1.5';
            path.style.filter = 'none';
            handleRegionLeave();
          };
        }
      }
    });

    return svgElement.outerHTML;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col items-center justify-center px-4 py-6">
      {/* 메인 제목 */}
      <div className="text-center mb-6 max-w-sm mx-auto">
        <h1 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
          💰 오늘은 어디서 <span className="text-orange-500">지역화폐</span>를 써볼까?
        </h1>
        <p className="text-sm text-gray-600 font-medium">
          원하는 지역을 선택해주세요
        </p>
      </div>

      {/* 경기도 지도 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-4xl w-full mb-6">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">경기도</h2>
          <p className="text-sm text-gray-500">31개 시·군</p>
        </div>
        
        {/* SVG 경기도 지도 */}
        <div className="relative">
          <style>{svgStyles}</style>
          <div 
            className="w-full h-auto"
            style={{ minHeight: '400px' }}
            dangerouslySetInnerHTML={{ __html: renderSvgWithInteractivity() }}
          />
          
          {/* 호버된 지역 정보 표시 */}
          {hoveredRegion && !selectedRegion && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="text-sm font-medium text-gray-800">{hoveredRegion.name}</div>
              <div className="text-xs text-gray-500">클릭하여 선택</div>
            </div>
          )}
          
          {/* 선택된 지역 정보 표시 */}
          {selectedRegion && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white rounded-lg shadow-lg p-4 border border-orange-600">
              <div className="text-sm font-bold mb-1">선택된 지역</div>
              <div className="text-base font-medium">{selectedRegion.name}</div>
              <button 
                onClick={() => setSelectedRegion(null)}
                className="mt-2 text-xs bg-white text-orange-500 px-2 py-1 rounded hover:bg-orange-50 transition-colors"
              >
                선택 해제
              </button>
            </div>
          )}
        </div>
        
        {/* 다음 단계 버튼 */}
        {selectedRegion && (
          <div className="text-center mt-6">
            <button 
              onClick={() => onCitySelect(selectedRegion.name)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {selectedRegion.name}에서 지역화폐 사용하기 →
            </button>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="text-center text-gray-400 text-xs">
        © kai.jeong — Contact: kai.jeong0@gmail.com
      </div>
    </div>
  );
};

export default RegionGrid;