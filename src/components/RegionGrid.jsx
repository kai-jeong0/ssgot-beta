import React, { useState, useEffect } from 'react';

const RegionGrid = ({ onCitySelect }) => {
  const [svgContent, setSvgContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    // 31개 시도군 SVG 파일을 public/gyeonggi-31-regions.svg에서 불러오기
    fetch('/gyeonggi-31-regions.svg')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(svgText => {
        console.log('SVG 로드 성공, 길이:', svgText.length);
        setSvgContent(svgText);
        setLoading(false);
      })
      .catch(error => {
        console.error('SVG 로드 실패:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // SVG 클릭 이벤트 핸들러
  const handleSvgClick = (event) => {
    // circle 요소나 g 요소를 클릭했을 때 처리
    if (event.target.tagName === 'circle' || event.target.tagName === 'g') {
      let regionId, regionName;
      
      if (event.target.tagName === 'circle') {
        // circle을 클릭한 경우 부모 g 요소에서 정보 가져오기
        const parentGroup = event.target.parentElement;
        regionId = parentGroup.getAttribute('data-region-id');
        regionName = parentGroup.getAttribute('data-name');
      } else {
        // g 요소를 직접 클릭한 경우
        regionId = event.target.getAttribute('data-region-id');
        regionName = event.target.getAttribute('data-name');
      }
      
      if (regionId && regionName) {
        setSelectedRegion({ id: regionId, name: regionName });
        
        // 부모 컴포넌트에 선택된 지역 전달
        if (onCitySelect) {
          onCitySelect(regionName);
        }
      }
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="bg-white flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 mb-2">지도 로딩 중...</div>
          <div className="text-sm text-gray-600">잠시만 기다려주세요</div>
        </div>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className="bg-white flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-bold text-red-600 mb-2">지도 로드 실패</div>
          <div className="text-sm text-gray-600 mb-4">오류: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex items-center justify-center h-screen">
      {/* 지역 선택 UI */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-4xl w-full">
        {/* SVG 경기도 지도 */}
        <div className="relative overflow-hidden rounded-lg border border-gray-300">
          <style>{`
            .gyeonggi-svg {
              width: 100%;
              height: auto;
              max-width: 800px;
              display: block;
            }
            .gyeonggi-svg circle {
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .gyeonggi-svg circle:hover {
              filter: brightness(1.1);
              stroke-width: 3;
              stroke: #ff7419;
            }
            .gyeonggi-svg .region-text {
              font-size: 12px;
              font-weight: bold;
              fill: #333;
              pointer-events: none;
              text-anchor: middle;
              dominant-baseline: middle;
            }
          `}</style>
          
          <div 
            className="gyeonggi-svg"
            dangerouslySetInnerHTML={{ __html: svgContent }}
            onClick={handleSvgClick}
          />
        </div>

        {/* 선택된 지역 표시 */}
        {selectedRegion && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium text-orange-800 mb-1">
                선택된 지역
              </div>
              <div className="text-base font-bold text-orange-900 mb-1">
                {selectedRegion.name}
              </div>
              <div className="text-xs text-orange-600">
                지역 코드: {selectedRegion.id}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionGrid;