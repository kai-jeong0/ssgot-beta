import React from 'react';

const RouteModal = ({ isOpen, store, onClose, onRouteSelect }) => {
  if (!isOpen || !store) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">길찾기</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{marginBottom: '16px', fontSize: '14px', color: '#666'}}>
          <strong>{store.name}</strong>으로 가는 길을 찾아보세요
        </div>
        <div className="route-options">
          <div 
            className="route-option" 
            onClick={() => onRouteSelect('walk')}
          >
            <div className="route-option-icon">🚶</div>
            <div className="route-option-text">도보</div>
          </div>
          <div 
            className="route-option" 
            onClick={() => onRouteSelect('transit')}
          >
            <div className="route-option-icon">🚌</div>
            <div className="route-option-text">대중교통</div>
          </div>
          <div 
            className="route-option" 
            onClick={() => onRouteSelect('car')}
          >
            <div className="route-option-icon">🚗</div>
            <div className="route-option-text">자동차</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteModal;
