import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

const StoreCard = ({ store, isSelected, onSelect, onRoute }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showTransitModal, setShowTransitModal] = useState(false);
  
  const onImgError = (e) => {
    console.warn(`⚠️ 이미지 로딩 실패: ${store.name}`, e.currentTarget.src);
    setImageError(true);
    // 기본 이미지로 fallback
    e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(store.name)}/400/300`;
  };

  const onImgLoad = () => {
    setImageLoaded(true);
    console.log(`✅ 이미지 로딩 성공: ${store.name}`);
  };

  // 이동수단 선택 처리
  const handleTransitSelect = (transitMode) => {
    setShowTransitModal(false);
    // onRoute에 이동수단 정보도 함께 전달
    onRoute(store, transitMode);
  };

  // 카테고리 한글 매핑 및 색상
  const getCategoryInfo = (category) => {
    const categoryMap = {
      'restaurant': { label: '음식점', color: 'red' },
      'cafe': { label: '카페', color: 'yellow' },
      'pharmacy': { label: '약국', color: 'green' },
      'mart': { label: '마트', color: 'blue' },
      'beauty': { label: '미용', color: 'purple' },
      'academy': { label: '학원', color: 'indigo' },
      'etc': { label: '기타', color: 'secondary' }
    };
    return categoryMap[category] || { label: '기타', color: 'secondary' };
  };

  const categoryInfo = getCategoryInfo(store.category);

  return (
    <>
    <Card
      className={`cursor-pointer transition-all duration-200 hover:scale-105 h-full store-card-responsive ${
        isSelected ? 'ring-2 ring-carrot ring-offset-2 border-carrot' : ''
      }`}
      data-card-id={store.id}
      onClick={() => onSelect(store)}
    >
      <CardHeader className="p-0 card-header">
        <div className="relative">
          {!imageLoaded && !imageError && (
            <div className="w-full h-32 bg-gray-200 rounded-t-xl flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-carrot"></div>
            </div>
          )}
          {imageError && (
            <div className="w-full h-32 bg-gray-200 rounded-t-xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-1">🏪</div>
                <div className="text-xs">이미지 없음</div>
              </div>
            </div>
          )}
          <img 
            src={store.photo} 
            alt={store.name} 
            onError={onImgError}
            onLoad={onImgLoad}
            className={`w-full h-32 object-cover rounded-t-xl transition-opacity duration-300 ${
              imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ display: (imageLoaded && !imageError) ? 'block' : 'none' }}
          />
          <div className="absolute top-2 left-2">
            <Badge variant={categoryInfo.color} className="text-xs">
              {categoryInfo.label}
            </Badge>
          </div>
          {store.status && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-xs bg-white/90">
                {store.status === 'open' ? '영업중' : '정보없음'}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-3 card-content">
        <div className="space-y-2 store-info">
          <div className="store-name-address">
            <h3 className="font-bold text-primary-text text-sm mb-1 truncate store-name" title={store.name}>
              {store.name}
            </h3>
            {store.address && (
              <div className="flex items-start gap-1 text-xs text-primary-body store-address">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="truncate" title={store.address}>{store.address}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between card-bottom">
          {store.distance && (
            <span className="text-xs text-primary-body distance">
              {store.distance}m
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowTransitModal(true);
            }}
            className="flex items-center gap-1 text-xs px-2 py-1 h-6 route-button"
          >
            <Navigation className="w-3 h-3" />
            찾아가기
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* 이동수단 선택 팝업 */}
    {showTransitModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            이동수단을 선택해주세요
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => handleTransitSelect('도보')}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="text-2xl">🚶</span>
              <span className="font-medium">도보</span>
            </button>
            <button
              onClick={() => handleTransitSelect('대중교통')}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="text-2xl">🚌</span>
              <span className="font-medium">대중교통</span>
            </button>
            <button
              onClick={() => handleTransitSelect('자차')}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="text-2xl">🚗</span>
              <span className="font-medium">자차</span>
            </button>
          </div>
          <button
            onClick={() => setShowTransitModal(false)}
            className="w-full mt-6 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </div>
    )}
  </>
  );
};

export default StoreCard;
