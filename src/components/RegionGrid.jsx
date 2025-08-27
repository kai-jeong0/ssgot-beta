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

    { id: "41820", name: "연천군" },
    { id: "41810", name: "포천군" },
    { id: "41840", name: "가평군" }
  ].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  // 지역 선택 핸들러
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    
    // 부모 컴포넌트에 선택된 지역 전달
    if (onCitySelect) {
      onCitySelect(region.name);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* 상단 헤더 - 여백 최소화 */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">쓰곳</h1>
            <div className="w-8 h-8 bg-carrot rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-primary-text mb-0">
            지역화폐를 쓸 곳을 선택해주세요
          </h2>
        </div>
      </div>

      {/* 메인 콘텐츠 - 상단 여백 최소화 */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4">
        {/* 지역 카드 그리드 */}
        <div className="grid grid-cols-3 gap-3 max-w-6xl mx-auto">
          {regions.map((region) => (
            <Card
              key={region.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:border-carrot hover:shadow-lg ${
                selectedRegion?.id === region.id
                  ? 'ring-2 ring-carrot ring-offset-2'
                  : ''
              }`}
              onClick={() => handleRegionSelect(region)}
            >
              <CardContent className="p-3 text-center">
                <CardTitle className="text-sm sm:text-base font-bold mb-0">{region.name}</CardTitle>
                {selectedRegion?.id === region.id && (
                  <div className="mt-2">
                    <div className="w-4 h-4 bg-carrot rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 선택된 지역 정보 */}
        {selectedRegion && (
          <div className="mt-8 max-w-2xl mx-auto px-4">
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-carrot">
              <CardHeader className="text-center pb-3">
                <div className="w-16 h-16 bg-carrot rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-primary-text">
                  선택된 지역
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-primary-text mb-2">
                  {selectedRegion.name}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 푸터 */}
        <footer className="mt-auto pt-8 pb-4">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-500">
              © kai.jeong — Contact: kai.jeong0@gmail.com
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RegionGrid;