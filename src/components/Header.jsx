import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, MapPin } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

/**
 * @typedef {Object} HeaderProps
 * @property {'region' | 'map'} mode - 현재 모드
 * @property {string} searchName - 검색어
 * @property {function} setSearchName - 검색어 설정 함수
 * @property {string} category - 선택된 카테고리
 * @property {function} setCategory - 카테고리 설정 함수
 * @property {Array} stores - 업체 목록
 * @property {function} onBack - 뒤로가기 함수
 * @property {'도보' | '대중교통' | '자차'} transitMode - 선택된 이동수단
 * @property {function} onTransitModeChange - 이동수단 변경 함수
 */

const Header = React.forwardRef(({ 
  mode, 
  searchName, 
  setSearchName, 
  onBack, 
  category, 
  setCategory,
  stores = [], // 업체 목록을 props로 받음
  transitMode,
  onTransitModeChange
}, ref) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredStores, setFilteredStores] = useState([]);
  const searchRef = useRef(null);

  const CATS = [
    { id: "all", label: "전체", color: "default" },
    { id: "restaurant", label: "음식점", color: "red" },
    { id: "cafe", label: "카페", color: "yellow" },
    { id: "pharmacy", label: "약국", color: "green" },
    { id: "mart", label: "마트", color: "blue" },
    { id: "beauty", label: "미용", color: "purple" },
    { id: "academy", label: "학원", color: "indigo" },
    { id: "etc", label: "기타", color: "secondary" },
  ];

  // 검색어 변경 시 자동완성 필터링
  useEffect(() => {
    if (!searchName.trim()) {
      setFilteredStores([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = stores
      .filter(store => store.name && store.name.toLowerCase().includes(searchName.toLowerCase()))
      .slice(0, 5); // 최대 5개만 표시
    
    setFilteredStores(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchName, stores]);

  // 검색창 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 뒤로가기 시 검색창 초기화
  const handleBack = () => {
    setSearchName('');
    setShowSuggestions(false);
    onBack();
  };

  // 자동완성 항목 선택
  const handleSuggestionSelect = (storeName) => {
    setSearchName(storeName);
    setShowSuggestions(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* 상단 바 */}
        <div className="flex items-center justify-between px-3 py-3">
          {mode === 'map' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label="뒤로가기"
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          {mode !== 'map' && (
            <div className="flex-1 text-center">
              {/* 지역 선택 화면에서는 텍스트를 표시하지 않음 - RegionGrid에서 처리 */}
            </div>
          )}
          
          {mode === 'map' && (
            <div className="flex-1 max-w-sm mx-3">
              <div className="relative" ref={searchRef}>
                <input
                  placeholder="런던 베이글 뮤지엄"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setSearchName(e.currentTarget.value)}
                  onFocus={() => searchName.trim() && filteredStores.length > 0 && setShowSuggestions(true)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-carrot focus:border-carrot transition-all duration-200 text-sm"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                
                {/* 자동완성 콤보박스 */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredStores.map((store, index) => (
                      <div
                        key={store.id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        onClick={() => handleSuggestionSelect(store.name)}
                      >
                        <div className="font-medium text-sm text-gray-900">{store.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{store.address}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* 카테고리 칩 */}
        {mode === 'map' && (
          <div className="px-3 pb-3">
            <div className="flex flex-wrap gap-2">
              {CATS.map(cat => (
                <Badge
                  key={cat.id}
                  variant={category === cat.id ? cat.color : "outline"}
                  className={`cursor-pointer transition-all duration-200 text-xs ${
                    category === cat.id ? 'scale-105' : 'hover:scale-105'
                  }`}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* 이동수단 선택 UI */}
        {mode === 'map' && (
          <div className="px-3 pb-3">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => onTransitModeChange('도보')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  transitMode === '도보' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                🚶 도보
              </button>
              <button
                onClick={() => onTransitModeChange('대중교통')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  transitMode === '대중교통' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                🚌 대중교통
              </button>
              <button
                onClick={() => onTransitModeChange('자차')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  transitMode === '자차' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                🚗 자차
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
});

export default Header;
