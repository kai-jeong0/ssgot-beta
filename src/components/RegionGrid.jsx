import React, { useState, useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const RegionGrid = ({ onCitySelect }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [nearestRegion, setNearestRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

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

  // 각 지역의 대략적인 중심 좌표 (위도, 경도)
  const regionCoordinates = {
    "안산시": { lat: 37.3219, lng: 126.8309 },
    "안양시": { lat: 37.3925, lng: 126.9269 },
    "안성시": { lat: 37.0080, lng: 127.2797 },
    "평택시": { lat: 36.9920, lng: 127.1128 },
    "부천시": { lat: 37.5035, lng: 126.7060 },
    "고양시": { lat: 37.6584, lng: 126.8320 },
    "과천시": { lat: 37.4295, lng: 126.9875 },
    "구리시": { lat: 37.5944, lng: 127.1296 },
    "김포시": { lat: 37.6154, lng: 126.7157 },
    "남양주시": { lat: 37.6364, lng: 127.2162 },
    "오산시": { lat: 37.1498, lng: 127.0772 },
    "파주시": { lat: 37.8154, lng: 126.7928 },
    "군포시": { lat: 37.3616, lng: 126.9357 },
    "시흥시": { lat: 37.3799, lng: 126.8031 },
    "수원시": { lat: 37.2636, lng: 127.0286 },
    "성남시": { lat: 37.4449, lng: 127.1389 },
    "의왕시": { lat: 37.3446, lng: 126.9482 },
    "의정부시": { lat: 37.7381, lng: 127.0337 },
    "하남시": { lat: 37.5392, lng: 127.2148 },
    "화성시": { lat: 37.1995, lng: 126.8319 },
    "광주시": { lat: 37.4295, lng: 127.2550 },
    "광명시": { lat: 37.4795, lng: 126.8649 },
    "이천시": { lat: 37.2720, lng: 127.4350 },
    "용인시": { lat: 37.2411, lng: 127.1776 },
    "여주시": { lat: 37.2983, lng: 127.6370 },
    "동두천시": { lat: 37.9036, lng: 127.0606 },
    "양평군": { lat: 37.4910, lng: 127.4874 },
    "연천군": { lat: 38.0966, lng: 127.0747 },
    "포천군": { lat: 37.8949, lng: 127.2002 },
    "가평군": { lat: 37.8315, lng: 127.5105 }
  };

  // 현재 위치 가져오기 및 가장 가까운 지역 찾기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });

          // 가장 가까운 지역 찾기
          let minDistance = Infinity;
          let nearest = null;

          regions.forEach(region => {
            const coords = regionCoordinates[region.name];
            if (coords) {
              const distance = Math.sqrt(
                Math.pow(coords.lat - userLat, 2) + 
                Math.pow(coords.lng - userLng, 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                nearest = region;
              }
            }
          });

          if (nearest) {
            setNearestRegion(nearest);
            console.log(`📍 가장 가까운 지역: ${nearest.name} (거리: ${(minDistance * 111).toFixed(1)}km)`);
          }
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, []);

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
      {/* 상단 헤더 - 여백 완전 제거 */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex-shrink-0">
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

      {/* 메인 콘텐츠 - 적절한 간격 조정 */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {/* 지역 카드 그리드 */}
        <div className="grid grid-cols-3 gap-3 max-w-6xl mx-auto">
          {regions.map((region) => (
            <Card
              key={region.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:border-carrot hover:shadow-lg ${
                selectedRegion?.id === region.id
                  ? 'ring-2 ring-carrot ring-offset-2'
                  : nearestRegion?.id === region.id
                  ? 'ring-2 ring-blue-400 ring-offset-2 bg-blue-50'
                  : ''
              }`}
              onClick={() => handleRegionSelect(region)}
            >
              <CardContent className="p-3 text-center relative">
                <CardTitle className="text-sm sm:text-base font-bold mb-0">{region.name}</CardTitle>
                
                {/* 가장 가까운 지역 표시 */}
                {nearestRegion?.id === region.id && (
                  <div className="absolute top-1 right-1">
                    <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                      <MapPin className="w-2 h-2 text-white" />
                    </div>
                  </div>
                )}
                
                {/* 선택 표시 */}
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