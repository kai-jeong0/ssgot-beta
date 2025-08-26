import React, { useState, useEffect } from 'react';

const RegionGrid = ({ onCitySelect }) => {
  const [svgContent, setSvgContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // 31개 시도군 데이터 (가나다순 정렬, 시만 표시)
  const regions = [
    { id: "41270", name: "안산시", type: "시", description: "반도체 산업도시", color: "#F0F8FF" },
    { id: "41170", name: "안양시", type: "시", description: "교통의 요충지", color: "#F5F5DC" },
    { id: "41550", name: "안성시", type: "시", description: "중부 경기도", color: "#F0FFF0" },
    { id: "41220", name: "평택시", type: "시", description: "항만과 산업도시", color: "#FFF0F5" },
    { id: "41190", name: "부천시", type: "시", description: "서울 근교 도시", color: "#FFF8DC" },
    { id: "41280", name: "고양시", type: "시", description: "서울 북부 접경", color: "#F5F5F5" },
    { id: "41290", name: "과천시", type: "시", description: "정부청사 소재지", color: "#F8F8FF" },
    { id: "41310", name: "구리시", type: "시", description: "한강변 도시", color: "#FFFACD" },
    { id: "41570", name: "김포시", type: "시", description: "서해안 접경", color: "#FFF5EE" },
    { id: "41360", name: "남양주시", type: "시", description: "서울 동부 접경", color: "#F0FFF0" },
    { id: "41370", name: "오산시", type: "시", description: "중부 경기도", color: "#FFF5EE" },
    { id: "41480", name: "파주시", type: "시", description: "DMZ 접경도시", color: "#F0F8FF" },
    { id: "41410", name: "군포시", type: "시", description: "서울 남부 접경", color: "#F0F8FF" },
    { id: "41390", name: "시흥시", type: "시", description: "서해안 접경", color: "#F5F5DC" },
    { id: "41110", name: "수원시", type: "시", description: "경기도청 소재지", color: "#FFE4E1" },
    { id: "41130", name: "성남시", type: "시", description: "IT 산업의 중심지", color: "#E6F3FF" },
    { id: "41430", name: "의왕시", type: "시", description: "서울 남부 접경", color: "#FFF8DC" },
    { id: "41150", name: "의정부시", type: "시", description: "북부 경기도의 중심", color: "#F0F8FF" },
    { id: "41450", name: "하남시", type: "시", description: "서울 동부 접경", color: "#F0FFF0" },
    { id: "41590", name: "화성시", type: "시", description: "반도체 산업도시", color: "#F8F8FF" },
    { id: "41610", name: "광주시", type: "시", description: "서울 동부 접경", color: "#F0F8FF" },
    { id: "41210", name: "광명시", type: "시", description: "서울 남부 접경", color: "#F0FFF0" },
    { id: "41500", name: "이천시", type: "시", description: "도자기 도시", color: "#FFF8DC" },
    { id: "41460", name: "용인시", type: "시", description: "대학도시", color: "#F5F5DC" },
    { id: "41630", name: "여주시", type: "시", description: "강변 도시", color: "#FFF8DC" },
    { id: "41250", name: "동두천시", type: "시", description: "북부 경기도", color: "#FDF5E6" },
    { id: "41830", name: "양평군", type: "군", description: "강원도 접경", color: "#F0FFF0" },
    { id: "41800", name: "고양군", type: "군", description: "서울 북부 접경", color: "#FFF5EE" },
    { id: "41820", name: "연천군", type: "군", description: "DMZ 접경", color: "#F8F8FF" },
    { id: "41810", name: "포천군", type: "군", description: "북부 경기도", color: "#F0F8FF" },
    { id: "41840", name: "가평군", type: "군", description: "강원도 접경", color: "#FFFACD" }
  ];

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

  // 지역 선택 핸들러
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    
    // 부모 컴포넌트에 선택된 지역 전달
    if (onCitySelect) {
      onCitySelect(region.name);
    }

    // SVG에서 해당 지역 하이라이트
    highlightRegionInSVG(region.id);
  };

  // SVG에서 지역 하이라이트
  const highlightRegionInSVG = (regionId) => {
    const svgElement = document.querySelector('.gyeonggi-svg svg');
    if (svgElement) {
      // 모든 지역의 하이라이트 제거
      const allRegions = svgElement.querySelectorAll('.region');
      allRegions.forEach(region => {
        const circle = region.querySelector('circle');
        if (circle) {
          circle.style.stroke = 'none';
          circle.style.strokeWidth = '0';
        }
      });

      // 선택된 지역 하이라이트
      const selectedRegion = svgElement.querySelector(`#${regionId}`);
      if (selectedRegion) {
        const circle = selectedRegion.querySelector('circle');
        if (circle) {
          circle.style.stroke = '#ff7419';
          circle.style.strokeWidth = '3';
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
    <div className="bg-white h-screen flex flex-col">
      {/* 상단 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">지역 선택</h1>
          <p className="text-sm text-gray-600">경기도 31개 시도군 중 원하는 지역을 선택해주세요</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 - 지역 리스트 */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* 지역 리스트 */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {regions.map((region) => (
                <div
                  key={region.id}
                  onClick={() => handleRegionSelect(region)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedRegion?.id === region.id
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-semibold text-gray-900">
                          {region.name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          region.type === '시' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {region.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{region.description}</p>
                    </div>
                    <div className="ml-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: region.color }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 - 지도 */}
        <div className="flex-1 bg-white flex flex-col">
          {/* 지도 제목 */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">경기도 지도</h2>
            <p className="text-sm text-gray-600">선택한 지역이 지도에서 하이라이트됩니다</p>
          </div>

          {/* SVG 지도 */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="relative border border-gray-300 rounded-lg overflow-hidden">
              <style>{`
                .gyeonggi-svg {
                  width: 100%;
                  height: auto;
                  max-width: 100%;
                  display: block;
                }
                .gyeonggi-svg circle {
                  cursor: pointer;
                  transition: all 0.3s ease;
                }
                .gyeonggi-svg circle:hover {
                  filter: brightness(1.1);
                  stroke-width: 2;
                  stroke: #ff7419;
                }
                .gyeonggi-svg .region-text {
                  font-size: 10px;
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
              />
            </div>
          </div>

          {/* 선택된 지역 정보 */}
          {selectedRegion && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  선택된 지역
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {selectedRegion.name}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {selectedRegion.description}
                </div>
                <div className="text-xs text-gray-500">
                  지역 코드: {selectedRegion.id}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionGrid;