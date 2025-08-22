import React, { useState, useMemo } from 'react';

/**
 * 경기도 지역 선택 컴포넌트
 * 
 * @description 네이버 부동산 스타일의 지역 선택 UI
 * - 좌측: 지도형 선택 (단순화된 SVG 기반 영역 클릭)
 * - 우측: 목록형 선택 (검색 + 버튼 목록)
 * 
 * @props
 * - onSelectCity: (city: { id: string; label: string }) => void
 * - className?: string
 * 
 * @todo Phase 2: 실제 지도 API (네이버/카카오/Leaflet)로 교체
 */

// 경기도 31개 시·군 데이터 (하드코딩 시작)
// TODO: 서버/환경 변수에서 주입 가능하도록 변경
const GYEONGGI_CITIES = [
  { id: 'suwon', label: '수원시', zone: 'central' },
  { id: 'seongnam', label: '성남시', zone: 'central' },
  { id: 'goyang', label: '고양시', zone: 'northwest' },
  { id: 'yongin', label: '용인시', zone: 'central' },
  { id: 'bucheon', label: '부천시', zone: 'central' },
  { id: 'ansan', label: '안산시', zone: 'southwest' },
  { id: 'anyang', label: '안양시', zone: 'central' },
  { id: 'namyangju', label: '남양주시', zone: 'northeast' },
  { id: 'hwaseong', label: '화성시', zone: 'southwest' },
  { id: 'pyeongtaek', label: '평택시', zone: 'southwest' },
  { id: 'uijeongbu', label: '의정부시', zone: 'north' },
  { id: 'siheung', label: '시흥시', zone: 'southwest' },
  { id: 'gimpo', label: '김포시', zone: 'northwest' },
  { id: 'gwangmyeong', label: '광명시', zone: 'central' },
  { id: 'gwangju-gg', label: '광주시(경기)', zone: 'central' },
  { id: 'gunpo', label: '군포시', zone: 'central' },
  { id: 'uiwang', label: '의왕시', zone: 'central' },
  { id: 'hanam', label: '하남시', zone: 'central' },
  { id: 'osan', label: '오산시', zone: 'central' },
  { id: 'icheon', label: '이천시', zone: 'southeast' },
  { id: 'anseong', label: '안성시', zone: 'southeast' },
  { id: 'paju', label: '파주시', zone: 'northwest' },
  { id: 'yangju', label: '양주시', zone: 'north' },
  { id: 'pocheon', label: '포천시', zone: 'northeast' },
  { id: 'yeoju', label: '여주시', zone: 'southeast' },
  { id: 'dongducheon', label: '동두천시', zone: 'north' },
  { id: 'guri', label: '구리시', zone: 'northeast' },
  { id: 'gwacheon', label: '과천시', zone: 'central' },
  { id: 'gapyeong', label: '가평군', zone: 'northeast' },
  { id: 'yangpyeong', label: '양평군', zone: 'southeast' },
  { id: 'yeoncheon', label: '연천군', zone: 'north' }
];

// 지도 존(Zone) 정의 - 단순화된 클러스터링
const MAP_ZONES = {
  central: { id: 'central', label: '중부권', color: 'hover:bg-blue-100', cities: ['suwon', 'seongnam', 'yongin', 'bucheon', 'anyang', 'gwangmyeong', 'gwangju-gg', 'gunpo', 'uiwang', 'hanam', 'osan', 'gwacheon'] },
  northwest: { id: 'northwest', label: '서북부권', color: 'hover:bg-green-100', cities: ['goyang', 'gimpo', 'paju'] },
  northeast: { id: 'northeast', label: '동북부권', color: 'hover:bg-purple-100', cities: ['namyangju', 'pocheon', 'guri', 'gapyeong'] },
  southwest: { id: 'southwest', label: '서남부권', color: 'hover:bg-orange-100', cities: ['ansan', 'hwaseong', 'pyeongtaek', 'siheung'] },
  southeast: { id: 'southeast', label: '동남부권', color: 'hover:bg-pink-100', cities: ['icheon', 'anseong', 'yeoju', 'yangpyeong'] },
  north: { id: 'north', label: '북부권', color: 'hover:bg-yellow-100', cities: ['uijeongbu', 'yangju', 'dongducheon', 'yeoncheon'] }
};

function RegionPickerGyeonggi({ onSelectCity, className = '' }) {
  const [query, setQuery] = useState('');
  const [hoveredZone, setHoveredZone] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // 검색 필터링
  const filteredCities = useMemo(() => {
    if (!query.trim()) return GYEONGGI_CITIES;
    return GYEONGGI_CITIES.filter(city => 
      city.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  // 도시 선택 핸들러
  const handleSelectCity = (city) => {
    setSelectedId(city.id);
    onSelectCity?.(city);
  };

  // 지도 존 클릭 핸들러 (대표 도시로 선택)
  const handleZoneClick = (zoneId) => {
    const zone = MAP_ZONES[zoneId];
    if (zone && zone.cities.length > 0) {
      // 각 존의 첫 번째 도시를 대표로 선택
      const representativeCity = GYEONGGI_CITIES.find(city => city.id === zone.cities[0]);
      if (representativeCity) {
        handleSelectCity(representativeCity);
      }
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto bg-white ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 좌측: 지도형 선택 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">지도에서 선택</h3>
          
          <div className="relative bg-gray-50 rounded-lg p-4 border">
            <svg 
              viewBox="0 0 400 300" 
              className="w-full h-auto max-h-80"
              role="img"
              aria-label="경기도 지도"
            >
              {/* 단순화된 경기도 형태 - 6개 권역으로 분할 */}
              
              {/* 서북부권 (고양, 김포, 파주) */}
              <path
                d="M 50 80 L 150 60 L 180 100 L 120 130 L 80 120 Z"
                className={`fill-green-50 stroke-green-300 stroke-2 cursor-pointer transition-colors ${MAP_ZONES.northwest.color} ${hoveredZone === 'northwest' ? 'fill-green-200' : ''}`}
                onClick={() => handleZoneClick('northwest')}
                onMouseEnter={() => setHoveredZone('northwest')}
                onMouseLeave={() => setHoveredZone(null)}
                role="button"
                tabIndex={0}
                aria-label="서북부권 (고양시, 김포시, 파주시)"
                onKeyDown={(e) => e.key === 'Enter' && handleZoneClick('northwest')}
              />
              <text x="110" y="95" className="text-xs fill-gray-700 pointer-events-none">서북부</text>

              {/* 북부권 (의정부, 양주, 동두천, 연천) */}
              <path
                d="M 180 60 L 300 50 L 320 90 L 250 110 L 180 100 Z"
                className={`fill-yellow-50 stroke-yellow-300 stroke-2 cursor-pointer transition-colors ${MAP_ZONES.north.color} ${hoveredZone === 'north' ? 'fill-yellow-200' : ''}`}
                onClick={() => handleZoneClick('north')}
                onMouseEnter={() => setHoveredZone('north')}
                onMouseLeave={() => setHoveredZone(null)}
                role="button"
                tabIndex={0}
                aria-label="북부권 (의정부시, 양주시, 동두천시, 연천군)"
                onKeyDown={(e) => e.key === 'Enter' && handleZoneClick('north')}
              />
              <text x="240" y="80" className="text-xs fill-gray-700 pointer-events-none">북부</text>

              {/* 동북부권 (남양주, 포천, 구리, 가평) */}
              <path
                d="M 300 90 L 380 80 L 370 140 L 320 160 L 250 140 Z"
                className={`fill-purple-50 stroke-purple-300 stroke-2 cursor-pointer transition-colors ${MAP_ZONES.northeast.color} ${hoveredZone === 'northeast' ? 'fill-purple-200' : ''}`}
                onClick={() => handleZoneClick('northeast')}
                onMouseEnter={() => setHoveredZone('northeast')}
                onMouseLeave={() => setHoveredZone(null)}
                role="button"
                tabIndex={0}
                aria-label="동북부권 (남양주시, 포천시, 구리시, 가평군)"
                onKeyDown={(e) => e.key === 'Enter' && handleZoneClick('northeast')}
              />
              <text x="310" y="115" className="text-xs fill-gray-700 pointer-events-none">동북부</text>

              {/* 중부권 (수원, 성남, 용인 등 주요 도시) */}
              <path
                d="M 80 130 L 180 130 L 250 140 L 280 180 L 220 220 L 140 210 L 90 180 Z"
                className={`fill-blue-50 stroke-blue-300 stroke-2 cursor-pointer transition-colors ${MAP_ZONES.central.color} ${hoveredZone === 'central' ? 'fill-blue-200' : ''}`}
                onClick={() => handleZoneClick('central')}
                onMouseEnter={() => setHoveredZone('central')}
                onMouseLeave={() => setHoveredZone(null)}
                role="button"
                tabIndex={0}
                aria-label="중부권 (수원시, 성남시, 용인시, 부천시 등)"
                onKeyDown={(e) => e.key === 'Enter' && handleZoneClick('central')}
              />
              <text x="165" y="175" className="text-sm font-medium fill-gray-700 pointer-events-none">중부권</text>

              {/* 서남부권 (안산, 화성, 평택, 시흥) */}
              <path
                d="M 40 180 L 90 180 L 140 210 L 120 260 L 60 250 L 30 220 Z"
                className={`fill-orange-50 stroke-orange-300 stroke-2 cursor-pointer transition-colors ${MAP_ZONES.southwest.color} ${hoveredZone === 'southwest' ? 'fill-orange-200' : ''}`}
                onClick={() => handleZoneClick('southwest')}
                onMouseEnter={() => setHoveredZone('southwest')}
                onMouseLeave={() => setHoveredZone(null)}
                role="button"
                tabIndex={0}
                aria-label="서남부권 (안산시, 화성시, 평택시, 시흥시)"
                onKeyDown={(e) => e.key === 'Enter' && handleZoneClick('southwest')}
              />
              <text x="75" y="225" className="text-xs fill-gray-700 pointer-events-none">서남부</text>

              {/* 동남부권 (이천, 안성, 여주, 양평) */}
              <path
                d="M 220 220 L 280 200 L 340 220 L 320 270 L 250 280 L 200 260 Z"
                className={`fill-pink-50 stroke-pink-300 stroke-2 cursor-pointer transition-colors ${MAP_ZONES.southeast.color} ${hoveredZone === 'southeast' ? 'fill-pink-200' : ''}`}
                onClick={() => handleZoneClick('southeast')}
                onMouseEnter={() => setHoveredZone('southeast')}
                onMouseLeave={() => setHoveredZone(null)}
                role="button"
                tabIndex={0}
                aria-label="동남부권 (이천시, 안성시, 여주시, 양평군)"
                onKeyDown={(e) => e.key === 'Enter' && handleZoneClick('southeast')}
              />
              <text x="260" y="245" className="text-xs fill-gray-700 pointer-events-none">동남부</text>
            </svg>

            {/* 호버된 권역 정보 */}
            {hoveredZone && (
              <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-lg shadow-lg border">
                <div className="text-sm font-medium text-gray-900">
                  {MAP_ZONES[hoveredZone].label}
                </div>
                <div className="text-xs text-gray-600">
                  {MAP_ZONES[hoveredZone].cities.length}개 시·군
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 목록형 선택 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">목록에서 선택</h3>
            <span className="text-sm text-gray-500">총 {GYEONGGI_CITIES.length}개</span>
          </div>

          {/* 검색 입력 */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="시·군명 검색..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="경기도 시·군 검색"
            />
            <svg 
              className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* 도시 목록 */}
          <div className="max-h-80 overflow-y-auto">
            {filteredCities.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city)}
                    className={`px-4 py-3 text-left border rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      selectedId === city.id
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label={`${city.label} 선택`}
                  >
                    <div className="font-medium">{city.label}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="mt-2">검색 결과가 없어요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegionPickerGyeonggi;
