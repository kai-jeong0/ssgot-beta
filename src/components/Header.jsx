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
 */

const Header = React.forwardRef(({ 
  mode, 
  searchName, 
  setSearchName, 
  onBack, 
  category, 
  setCategory,
  stores = [], // 업체 목록을 props로 받음
}, ref) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredStores, setFilteredStores] = useState([]);
  const searchRef = useRef(null);

  const CATS = [
    { id: "all", label: "전체", color: "default", emoji: "🏪" },
    { id: "restaurant", label: "음식점", color: "default", emoji: "🍽️" },
    { id: "cafe", label: "카페", color: "default", emoji: "☕" },
    { id: "pharmacy", label: "약국", color: "default", emoji: "💊" },
    { id: "mart", label: "마트", color: "default", emoji: "🛒" },
    { id: "beauty", label: "미용", color: "default", emoji: "💄" },
    { id: "academy", label: "학원", color: "default", emoji: "📚" },
    { id: "exercise", label: "운동", color: "default", emoji: "💪" },
    { id: "bookstore", label: "서점", color: "default", emoji: "📖" },
    { id: "etc", label: "기타", color: "default", emoji: "🔧" },
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 header-responsive" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* 지역 선택 화면 헤더 */}
        {mode === 'region' && (
          <div className="flex items-center justify-center py-2 px-4">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-carrot rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
                                <span className="text-sm font-bold text-gray-900">쓰곳</span>
            </div>
          </div>
        )}
        
        {/* 상단 바 */}
        {mode === 'map' && (
          <div className="flex items-center justify-between px-3 py-3 header-top-responsive">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label="뒤로가기"
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 max-w-sm mx-3 search-container-responsive">
              <div className="relative" ref={searchRef}>
                <input
                  placeholder="상호명을 검색해 보세요"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setSearchName(e.currentTarget.value)}
                  onFocus={() => searchName.trim() && filteredStores.length > 0 && setShowSuggestions(true)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-carrot focus:border-carrot transition-all duration-200 text-sm search-input-responsive"
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
          </div>
        )}
        
        {/* 카테고리 칩 */}
        {mode === 'map' && (
          <div className="px-3 pb-3 category-container-responsive">
            <div className="flex flex-wrap gap-2 category-chips-responsive">
              {CATS.map(cat => (
                <Badge
                  key={cat.id}
                  variant={category === cat.id ? cat.color : "outline"}
                  className={`cursor-pointer transition-all duration-200 text-xs ${
                    category === cat.id ? 'scale-105' : 'hover:scale-105'
                  }`}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.emoji} {cat.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
});

export default Header;
