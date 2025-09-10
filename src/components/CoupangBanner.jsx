const CoupangBanner = ({ position = 'left' }) => {
  return (
    <div 
      className={`coupang-banner coupang-banner-${position}`}
      style={{
        width: '200px',
        height: '500px',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...(position === 'left' ? { left: '10px' } : { right: '10px' })
      }}
    >
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe 
          src="https://ads-partners.coupang.com/widgets.html?id=920240&template=carousel&trackingCode=AF9221142&subId=&width=200&height=500&tsource=" 
          width="200" 
          height="500" 
          frameBorder="0" 
          scrolling="no" 
          referrerPolicy="unsafe-url"
          style={{
            border: 'none',
            borderRadius: '8px',
            width: '100%',
            height: '100%'
          }}
          title="쿠팡 파트너스 광고"
        />
      </div>
      
      {/* 쿠팡 파트너스 수수료 안내 문구 */}
      <div 
        style={{
          padding: '4px 6px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          fontSize: '8px',
          lineHeight: '1.2',
          color: '#6c757d',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </div>
    </div>
  );
};

export default CoupangBanner;
