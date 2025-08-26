import React, { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

const RegionGrid = ({ onCitySelect }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);

  // 31개 시도군 데이터 (가나다순 정렬)
  const regions = [
    { id: "41270", name: "안산시", type: "시", description: "반도체 산업도시", color: "blue" },
    { id: "41170", name: "안양시", type: "시", description: "교통의 요충지", color: "green" },
    { id: "41550", name: "안성시", type: "시", description: "중부 경기도", color: "yellow" },
    { id: "41220", name: "평택시", type: "시", description: "항만과 산업도시", color: "purple" },
    { id: "41190", name: "부천시", type: "시", description: "서울 근교 도시", color: "red" },
    { id: "41280", name: "고양시", type: "시", description: "서울 북부 접경", color: "blue" },
    { id: "41290", name: "과천시", type: "시", description: "정부청사 소재지", color: "green" },
    { id: "41310", name: "구리시", type: "시", description: "한강변 도시", color: "yellow" },
    { id: "41570", name: "김포시", type: "시", description: "서해안 접경", color: "purple" },
    { id: "41360", name: "남양주시", type: "시", description: "서울 동부 접경", color: "red" },
    { id: "41370", name: "오산시", type: "시", description: "중부 경기도", color: "blue" },
    { id: "41480", name: "파주시", type: "시", description: "DMZ 접경도시", color: "green" },
    { id: "41410", name: "군포시", type: "시", description: "서울 남부 접경", color: "yellow" },
    { id: "41390", name: "시흥시", type: "시", description: "서해안 접경", color: "purple" },
    { id: "41110", name: "수원시", type: "시", description: "경기도청 소재지", color: "red" },
    { id: "41130", name: "성남시", type: "시", description: "IT 산업의 중심지", color: "blue" },
    { id: "41430", name: "의왕시", type: "시", description: "서울 남부 접경", color: "green" },
    { id: "41150", name: "의정부시", type: "시", description: "북부 경기도의 중심", color: "yellow" },
    { id: "41450", name: "하남시", type: "시", description: "서울 동부 접경", color: "purple" },
    { id: "41590", name: "화성시", type: "시", description: "반도체 산업도시", color: "red" },
    { id: "41610", name: "광주시", type: "시", description: "서울 동부 접경", color: "blue" },
    { id: "41210", name: "광명시", type: "시", description: "서울 남부 접경", color: "green" },
    { id: "41500", name: "이천시", type: "시", description: "도자기 도시", color: "yellow" },
    { id: "41460", name: "용인시", type: "시", description: "대학도시", color: "purple" },
    { id: "41630", name: "여주시", type: "시", description: "강변 도시", color: "red" },
    { id: "41250", name: "동두천시", type: "시", description: "북부 경기도", color: "blue" },
    { id: "41830", name: "양평군", type: "군", description: "강원도 접경", color: "green" },
    { id: "41800", name: "고양군", type: "군", description: "서울 북부 접경", color: "yellow" },
    { id: "41820", name: "연천군", type: "군", description: "DMZ 접경", color: "purple" },
    { id: "41810", name: "포천군", type: "군", description: "북부 경기도", color: "red" },
    { id: "41840", name: "가평군", type: "군", description: "강원도 접경", color: "blue" }
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
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-text mb-4">
            지역화폐를 쓸 곳을 선택해주세요
          </h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 지역 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={region.color} className="text-xs">
                    {region.type}
                  </Badge>
                  {selectedRegion?.id === region.id && (
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardTitle className="text-xl mb-2">{region.name}</CardTitle>
                <p className="text-sm text-primary-body">{region.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 선택된 지역 정보 */}
        {selectedRegion && (
          <div className="mt-16 max-w-2xl mx-auto px-4">
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
                <div className="text-4xl font-bold text-primary-text mb-2">
                  {selectedRegion.name}
                </div>
                <p className="text-primary-body">
                  {selectedRegion.description}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionGrid;