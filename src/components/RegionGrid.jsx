import React, { useState } from 'react';

const RegionGrid = ({ onCitySelect }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);

  // 31개 시도군 데이터 (가나다순 정렬)
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

  // 지역 선택 핸들러
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    
    // 부모 컴포넌트에 선택된 지역 전달
    if (onCitySelect) {
      onCitySelect(region.name);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 상단 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">지역화폐를 쓸 곳을 선택해주세요</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 지역 카드 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {regions.map((region) => (
            <div
              key={region.id}
              onClick={() => handleRegionSelect(region)}
              className={`group relative bg-white rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedRegion?.id === region.id
                  ? 'border-orange-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* 카드 배경색 */}
              <div 
                className="absolute inset-0 rounded-xl opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                style={{ backgroundColor: region.color }}
              ></div>
              
              {/* 카드 내용 */}
              <div className="relative p-4 text-center">
                {/* 지역명만 표시 */}
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                  {region.name}
                </h3>
                
                {/* 선택 표시 */}
                {selectedRegion?.id === region.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 선택된 지역 정보 */}
        {selectedRegion && (
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="mb-4">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-orange-900 mb-2">
                  선택된 지역
                </h2>
              </div>
              
              <div className="space-y-3">
                <div className="text-3xl font-bold text-gray-900">
                  {selectedRegion.name}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionGrid;