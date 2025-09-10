import React from 'react';
import { Store, MapPin, Loader2 } from 'lucide-react';
import StoreCard from './StoreCard';
import CoupangHorizontalBanner from './CoupangHorizontalBanner';

const BottomList = ({ 
  stores, 
  selectedId, 
  loading, 
  selectedCity, 
  onSelect, 
  onRoute,
  onViewDetail 
}) => {
  return (
    <div className="bg-white border-t border-gray-200 h-80 flex-shrink-0 bottom-list-responsive">
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-primary-text">
                  {loading ? '불러오는 중…' : `${stores?.length?.toLocaleString() || 0}개 가맹점`}
                </div>
                {selectedCity && (
                  <div className="flex items-center gap-1 text-xs text-primary-body">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedCity}</span>
                  </div>
                )}
              </div>
            </div>
            
            {loading && (
              <div className="flex items-center gap-1 text-xs text-primary-body">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>로딩 중...</span>
              </div>
            )}
          </div>
        </div>

        {/* 가맹점 리스트 - 가로 스크롤 */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
              <p className="text-sm font-medium text-primary-text mb-1">
                업체 정보를 불러오는 중...
              </p>
              <p className="text-xs text-primary-body">
                잠시만 기다려주세요
              </p>
            </div>
          ) : (!stores || stores.length === 0) ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Store className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-primary-text mb-1">
                검색된 업체가 없습니다
              </p>
              <p className="text-xs text-primary-body">
                다른 검색어나 카테고리를 시도해보세요
              </p>
            </div>
          ) : (
            <div className="h-full overflow-x-auto overflow-y-hidden">
              <div className="flex gap-3 px-4 pt-4 pb-12 min-w-max store-list-responsive">
                {(() => {
                  const items = [];
                  
                  stores.forEach((store, index) => {
                    // 업체 카드 추가
                    items.push(
                      <div key={store.id} className="w-40 flex-shrink-0 store-card-responsive">
                        <StoreCard
                          store={store}
                          isSelected={selectedId === store.id}
                          onSelect={onSelect}
                          onRoute={onRoute}
                          onViewDetail={onViewDetail}
                        />
                      </div>
                    );
                    
                    // 배너 삽입 조건 확인
                    const shouldInsertBanner = 
                      (stores.length <= 5 && index === stores.length - 1) || // 5개 이하: 마지막에
                      (stores.length > 5 && (index + 1) % 7 === 0); // 5개 초과: 7번째마다
                    
                    if (shouldInsertBanner) {
                      items.push(
                        <div key={`banner-${index}`} className="w-40 flex-shrink-0 store-card-responsive">
                          <CoupangHorizontalBanner />
                        </div>
                      );
                    }
                  });
                  
                  return items;
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomList;
