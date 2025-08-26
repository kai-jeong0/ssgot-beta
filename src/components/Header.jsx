import React from 'react';
import { ArrowLeft, Search, MapPin } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const Header = React.forwardRef(({ 
  mode, 
  searchName, 
  setSearchName, 
  onBack, 
  category, 
  setCategory
}, ref) => {
  const CATS = [
    { id: "all", label: "전체", color: "default" },
    { id: "restaurant", label: "음식점", color: "red" },
    { id: "cafe", label: "카페", color: "yellow" },
    { id: "pharmacy", label: "약국", color: "green" },
    { id: "mart", label: "마트", color: "blue" },
    { id: "beauty", label: "미용", color: "purple" },
    { id: "etc", label: "기타", color: "secondary" },
  ];

  return (
    <header className="bg-white border-b border-border-light sticky top-0 z-50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* 상단 바 */}
        <div className="flex items-center justify-between px-4 py-4">
          {mode === 'map' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="뒤로가기"
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {mode !== 'map' && (
            <div className="flex-1 text-center">
              <div className="flex flex-col items-center">
                <h1 className="text-4xl font-bold text-primary-text mb-2">쓰곳</h1>
                <p className="text-sm text-primary-body">지역화폐 쓰는 곳</p>
              </div>
            </div>
          )}
          
          {mode === 'map' && (
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <input
                  placeholder="런던 베이글 뮤지엄"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setSearchName(e.currentTarget.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}
        </div>
        
        {/* 카테고리 칩 */}
        {mode === 'map' && (
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {CATS.map(cat => (
                <Badge
                  key={cat.id}
                  variant={category === cat.id ? cat.color : "outline"}
                  className={`cursor-pointer transition-all duration-200 ${
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
      </div>
    </header>
  );
});

export default Header;
