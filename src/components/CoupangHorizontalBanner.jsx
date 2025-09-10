const CoupangHorizontalBanner = () => {
  return (
    <div 
      className="coupang-horizontal-banner"
      style={{
        width: '350px',
        height: '232px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        margin: '10px auto',
        flexShrink: 0
      }}
    >
      <iframe 
        src="https://ads-partners.coupang.com/widgets.html?id=920243&template=carousel&trackingCode=AF9221142&subId=&width=350&height=232&tsource=" 
        width="350" 
        height="232" 
        frameBorder="0" 
        scrolling="no" 
        referrerPolicy="unsafe-url"
        style={{
          border: 'none',
          borderRadius: '8px',
          width: '100%',
          height: '100%'
        }}
        title="쿠팡 파트너스 가로 광고"
      />
    </div>
  );
};

export default CoupangHorizontalBanner;
