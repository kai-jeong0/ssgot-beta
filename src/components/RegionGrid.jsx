import React, { useState, useEffect } from 'react';

const RegionGrid = ({ onCitySelect }) => {
  const [svgContent, setSvgContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    // 새로 생성된 SVG 파일을 public/gyeonggi-real-regions.svg에서 불러오기
    fetch('/gyeonggi-real-regions.svg')
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
    if (event.target.tagName === 'path') {
      const regionId = event.target.getAttribute('data-region-id');
      const regionName = event.target.getAttribute('data-name');
      
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col items-center justify-center px-4 py-6">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col items-center justify-center px-4 py-6">
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
          <style>{`
            .gyeonggi-svg {
              width: 100%;
              height: auto;
            }
            .gyeonggi-svg path {
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .gyeonggi-svg path:hover {
              filter: brightness(1.1);
              stroke-width: 2;
            }
            .gyeonggi-svg .region-text {
              font-size: 8px;
              font-weight: bold;
              fill: #333;
              pointer-events: none;
            }
            .gyeonggi-svg .region-text:hover {
              fill: #ff7419;
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
              <div className="text-sm font-medium text-orange-800">
                선택된 지역: <span className="font-bold">{selectedRegion.name}</span>
              </div>
              <div className="text-xs text-orange-600 mt-1">
                지역 코드: {selectedRegion.id}
              </div>
            </div>
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