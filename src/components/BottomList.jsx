import React from 'react';
import StoreCard from './StoreCard';

const BottomList = ({ 
  stores, 
  selectedId, 
  loading, 
  selectedCity, 
  onSelect, 
  onRoute 
}) => {
  return (
    <div className="hlist-wrap expanded">{/* 항상 열린 상태 */}
      <div className="hlist-head">
        <div style={{fontWeight:700}}>
          {loading ? '불러오는 중…' : `${stores?.length?.toLocaleString() || 0}개 가맹점`}
        </div>
        {selectedCity && <div style={{fontSize:12,color:'#888'}}>{selectedCity}</div>}
      </div>
      <div className="hlist">
        {(!stores || stores.length === 0) && (
          <div style={{padding:'12px 14px',color:'#888'}}>검색된 업체가 없습니다</div>
        )}
        {stores && stores.map(store => (
          <StoreCard
            key={store.id}
            store={store}
            isSelected={selectedId === store.id}
            onSelect={onSelect}
            onRoute={onRoute}
          />
        ))}
      </div>
    </div>
  );
};

export default BottomList;
