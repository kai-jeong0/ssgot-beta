import React, { useState } from 'react';

const RegionGrid = ({ onCitySelect }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // 경기도 주요 도시들의 간단한 좌표 (SVG 내에서의 상대적 위치)
  const regions = [
    { id: 'suwon', name: '수원시', x: 50, y: 60, color: '#FF6B6B' },
    { id: 'seongnam', name: '성남시', x: 45, y: 45, color: '#4ECDC4' },
    { id: 'goyang', name: '고양시', x: 25, y: 25, color: '#45B7D1' },
    { id: 'yongin', name: '용인시', x: 55, y: 50, color: '#96CEB4' },
    { id: 'bucheon', name: '부천시', x: 30, y: 35, color: '#FFEAA7' },
    { id: 'ansan', name: '안산시', x: 35, y: 70, color: '#DDA0DD' },
    { id: 'anyang', name: '안양시', x: 40, y: 55, color: '#98D8C8' },
    { id: 'namyangju', name: '남양주시', x: 60, y: 30, color: '#F7DC6F' },
    { id: 'hwaseong', name: '화성시', x: 45, y: 75, color: '#BB8FCE' },
    { id: 'pyeongtaek', name: '평택시', x: 40, y: 80, color: '#85C1E9' },
    { id: 'uijeongbu', name: '의정부시', x: 55, y: 20, color: '#F8C471' },
    { id: 'siheung', name: '시흥시', x: 35, y: 65, color: '#82E0AA' },
    { id: 'gimpo', name: '김포시', x: 20, y: 40, color: '#F1948A' },
    { id: 'gwangmyeong', name: '광명시', x: 30, y: 60, color: '#85C1E9' },
    { id: 'gwangju', name: '광주시', x: 65, y: 45, color: '#D7BDE2' },
    { id: 'gunpo', name: '군포시', x: 35, y: 50, color: '#F9E79F' },
    { id: 'uiwang', name: '의왕시', x: 40, y: 50, color: '#A9DFBF' },
    { id: 'hanam', name: '하남시', x: 50, y: 35, color: '#D5A6BD' },
    { id: 'osan', name: '오산시', x: 45, y: 65, color: '#AED6F1' },
    { id: 'icheon', name: '이천시', x: 70, y: 55, color: '#FAD7A0' },
    { id: 'anseong', name: '안성시', x: 65, y: 65, color: '#D2B4DE' },
    { id: 'paju', name: '파주시', x: 15, y: 15, color: '#A3E4D7' },
    { id: 'yangju', name: '양주시', x: 45, y: 20, color: '#F8C471' },
    { id: 'pocheon', name: '포천시', x: 55, y: 15, color: '#D7BDE2' },
    { id: 'yeoju', name: '여주시', x: 75, y: 60, color: '#FAD7A0' },
    { id: 'dongducheon', name: '동두천시', x: 50, y: 15, color: '#BB8FCE' },
    { id: 'guri', name: '구리시', x: 55, y: 35, color: '#85C1E9' },
    { id: 'gwacheon', name: '과천시', x: 35, y: 45, color: '#F7DC6F' },
    { id: 'gapyeong', name: '가평군', x: 65, y: 25, color: '#A9DFBF' },
    { id: 'yangpyeong', name: '양평군', x: 70, y: 40, color: '#D5A6BD' },
    { id: 'yeoncheon', name: '연천군', x: 40, y: 10, color: '#F1948A' }
  ];

  const handleRegionClick = (region) => {
    onCitySelect(region.name);
  };

  const handleRegionHover = (region) => {
    setHoveredRegion(region);
  };

  const handleRegionLeave = () => {
    setHoveredRegion(null);
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
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-md w-full mb-6">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">경기도</h2>
          <p className="text-sm text-gray-500">31개 시·군</p>
        </div>
        
        {/* SVG 경기도 지도 */}
        <div className="relative">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-auto"
            style={{ minHeight: '300px' }}
          >
            {/* 경기도 외곽선 (간단한 직사각형) */}
            <rect 
              x="10" y="8" 
              width="80" height="85" 
              fill="none" 
              stroke="#E5E7EB" 
              strokeWidth="2"
              rx="3"
            />
            
            {/* 지역별 원형 마커 */}
            {regions.map((region) => (
              <g key={region.id}>
                <circle
                  cx={region.x}
                  cy={region.y}
                  r="3"
                  fill={hoveredRegion?.id === region.id ? '#FF7419' : region.color}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    filter: hoveredRegion?.id === region.id ? 'drop-shadow(0 0 8px rgba(255, 116, 25, 0.6))' : 'none'
                  }}
                  onClick={() => handleRegionClick(region)}
                  onMouseEnter={() => handleRegionHover(region)}
                  onMouseLeave={handleRegionLeave}
                />
                
                {/* 지역명 라벨 */}
                <text
                  x={region.x}
                  y={region.y + 8}
                  textAnchor="middle"
                  fontSize="2.5"
                  fill={hoveredRegion?.id === region.id ? '#FF7419' : '#6B7280'}
                  fontWeight={hoveredRegion?.id === region.id ? 'bold' : 'normal'}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none'
                  }}
                >
                  {region.name}
                </text>
              </g>
            ))}
            
            {/* 서울 표시 (참고용) */}
            <circle cx="35" cy="35" r="2" fill="#FFD700" stroke="#FFFFFF" strokeWidth="0.5" />
            <text x="35" y="42" textAnchor="middle" fontSize="2" fill="#FFD700" fontWeight="bold">서울</text>
            
            {/* 인천 표시 (참고용) */}
            <circle cx="25" cy="55" r="2" fill="#FFD700" stroke="#FFFFFF" strokeWidth="0.5" />
            <text x="25" y="62" textAnchor="middle" fontSize="2" fill="#FFD700" fontWeight="bold">인천</text>
          </svg>
          
        </div>
      </div>

      {/* 푸터 */}
      <div className="text-center text-gray-400 text-xs">
        © kai.jeong — Contact: kai.jeong0@gmail.com
      </div>
    </div>
  );
};

export default RegionGrid;