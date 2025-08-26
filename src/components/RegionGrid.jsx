import React, { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const RegionGrid = ({ onCitySelect }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);

  // 31개 시도군 데이터 (가나다순 정렬) - 설명과 타입 제거
  const regions = [
    { id: "41270", name: "안산시" },
    { id: "41170", name: "안양시" },
    { id: "41550", name: "안성시" },
    { id: "41220", name: "평택시" },
    { id: "41190", name: "부천시" },
    { id: "41280", name: "고양시" },
    { id: "41290", name: "과천시" },
    { id: "41310", name: "구리시" },
    { id: "41570", name: "김포시" },
    { id: "41360", name: "남양주시" },
    { id: "41370", name: "오산시" },
    { id: "41480", name: "파주시" },
    { id: "41410", name: "군포시" },
    { id: "41390", name: "시흥시" },
    { id: "41110", name: "수원시" },
    { id: "41130", name: "성남시" },
    { id: "41430", name: "의왕시" },
    { id: "41150", name: "의정부시" },
    { id: "41450", name: "하남시" },
    { id: "41590", name: "화성시" },
    { id: "41610", name: "광주시" },
    { id: "41210", name: "광명시" },
    { id: "41500", name: "이천시" },
    { id: "41460", name: "용인시" },
    { id: "41630", name: "여주시" },
    { id: "41250", name: "동두천시" },
    { id: "41830", name: "양평군" },
    { id: "41800", name: "고양군" },
    { id: "41820", name: "연천군" },
    { id: "41810", name: "포천군" },
    { id: "41840", name: "가평군" }
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
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-text mb-4">
            지역화폐를 쓸 곳을 선택해주세요
          </h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 지역 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {regions.map((region) => (
            <Card
              key={region.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedRegion?.id === region.id
                  ? 'ring-2 ring-black ring-offset-2'
                  : ''
              }`}
              onClick={() => handleRegionSelect(region)}
            >
              <CardContent className="p-4 text-center">
                <CardTitle className="text-lg sm:text-xl mb-0">{region.name}</CardTitle>
                {selectedRegion?.id === region.id && (
                  <div className="mt-2">
                    <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 선택된 지역 정보 */}
        {selectedRegion && (
          <div className="mt-12 max-w-2xl mx-auto px-4">
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-black">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-primary-text">
                  선택된 지역
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-primary-text mb-2">
                  {selectedRegion.name}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionGrid;