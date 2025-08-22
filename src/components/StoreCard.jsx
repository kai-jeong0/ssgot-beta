import React from 'react';

const StoreCard = ({ store, isSelected, onSelect, onRoute }) => {
  const onImgError = (e) => {
    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23f2f2f2'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  // 카테고리 한글 매핑
  const getCategoryLabel = (category) => {
    const categoryMap = {
      'restaurant': '음식점',
      'cafe': '카페',
      'pharmacy': '약국',
      'mart': '마트',
      'beauty': '미용',
      'etc': '기타'
    };
    return categoryMap[category] || '기타';
  };

  return (
    <div 
      className={`store-card ${isSelected ? 'store-card--selected' : ''}`} 
      data-card-id={store.id}
      onClick={() => onSelect(store)}
    >
      <div className="store-card__image-container">
        <img 
          src={store.photo} 
          alt={store.name} 
          onError={onImgError}
          className="store-card__image"
        />
        <div className="store-card__category-badge">
          {getCategoryLabel(store.category)}
        </div>
      </div>
      
      <div className="store-card__content">
        <div className="store-card__name" title={store.name}>
          {store.name}
        </div>
        
        <button 
          className="store-card__route-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRoute(store);
          }}
        >
          찾아가기
        </button>
      </div>
    </div>
  );
};

export default StoreCard;
