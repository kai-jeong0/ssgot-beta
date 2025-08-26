import React from 'react';
import { Store, MapPin, Loader2 } from 'lucide-react';
import StoreCard from './StoreCard';
import { Badge } from './ui/Badge';

const BottomList = ({ 
  stores, 
  selectedId, 
  loading, 
  selectedCity, 
  onSelect, 
  onRoute 
}) => {
  return (
    <div className="bg-white border-t border-border-light">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="px-4 py-4 border-b border-border-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-primary-text">
                  {loading ? '불러오는 중…' : `${stores?.length?.toLocaleString() || 0}개 가맹점`}
                </div>
                {selectedCity && (
                  <div className="flex items-center gap-2 text-sm text-primary-body">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedCity}</span>
                  </div>
                )}
              </div>
            </div>
            
            {loading && (
              <div className="flex items-center gap-2 text-sm text-primary-body">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>로딩 중...</span>
              </div>
            )}
          </div>
        </div>

        {/* 가맹점 리스트 */}
        <div className="px-4 py-4">
          {(!stores || stores.length === 0) ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-primary-text mb-2">
                검색된 업체가 없습니다
              </p>
              <p className="text-sm text-primary-body">
                다른 검색어나 카테고리를 시도해보세요
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stores.map(store => (
                <StoreCard
                  key={store.id}
                  store={store}
                  isSelected={selectedId === store.id}
                  onSelect={onSelect}
                  onRoute={onRoute}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomList;
