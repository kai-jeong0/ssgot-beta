import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

const StoreCard = ({ store, isSelected, onSelect, onRoute }) => {
  const onImgError = (e) => {
    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23f2f2f2'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  // 카테고리 한글 매핑 및 색상
  const getCategoryInfo = (category) => {
    const categoryMap = {
      'restaurant': { label: '음식점', color: 'red' },
      'cafe': { label: '카페', color: 'yellow' },
      'pharmacy': { label: '약국', color: 'green' },
      'mart': { label: '마트', color: 'blue' },
      'beauty': { label: '미용', color: 'purple' },
      'etc': { label: '기타', color: 'secondary' }
    };
    return categoryMap[category] || { label: '기타', color: 'secondary' };
  };

  const categoryInfo = getCategoryInfo(store.category);

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:scale-105 h-full ${
        isSelected ? 'ring-2 ring-carrot ring-offset-2 border-carrot' : ''
      }`}
      data-card-id={store.id}
      onClick={() => onSelect(store)}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <img 
            src={store.photo} 
            alt={store.name} 
            onError={onImgError}
            className="w-full h-32 object-cover rounded-t-xl"
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
      
      <CardContent className="p-3">
        <div className="space-y-2">
          <div>
            <h3 className="font-bold text-primary-text text-sm mb-1 truncate" title={store.name}>
              {store.name}
            </h3>
            {store.address && (
              <div className="flex items-start gap-1 text-xs text-primary-body">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{store.address}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            {store.distance && (
              <span className="text-xs text-primary-body">
                {store.distance}m
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRoute(store);
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 h-6"
            >
              <Navigation className="w-3 h-3" />
              찾아가기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreCard;
