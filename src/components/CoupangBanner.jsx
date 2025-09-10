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
        ...(position === 'left' ? { left: '10px' } : { right: '10px' })
      }}
    >
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
  );
};

export default CoupangBanner;
