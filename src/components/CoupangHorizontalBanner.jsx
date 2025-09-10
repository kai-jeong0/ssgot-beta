const CoupangHorizontalBanner = () => {
  // 모바일 환경 감지
  const isMobile = window.innerWidth < 768;
  
  // 모바일과 PC 환경에 따른 배너 설정
  const bannerConfig = isMobile ? {
    width: '140px',
    height: '180px',
    iframeSrc: 'https://ads-partners.coupang.com/widgets.html?id=920252&template=carousel&trackingCode=AF9221142&subId=&width=140&height=180&tsource=',
    iframeWidth: '140',
    iframeHeight: '180',
    title: '쿠팡 파트너스 모바일 광고'
  } : {
    width: '350px',
    height: '232px',
    iframeSrc: 'https://ads-partners.coupang.com/widgets.html?id=920243&template=carousel&trackingCode=AF9221142&subId=&width=350&height=232&tsource=',
    iframeWidth: '350',
    iframeHeight: '232',
    title: '쿠팡 파트너스 PC 광고'
  };

  return (
    <div 
      className="coupang-horizontal-banner w-full h-full"
      style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe 
          src={bannerConfig.iframeSrc}
          width={bannerConfig.iframeWidth}
          height={bannerConfig.iframeHeight}
          frameBorder="0" 
          scrolling="no" 
          referrerPolicy="unsafe-url"
          browsingtopics
          style={{
            border: 'none',
            borderRadius: '8px',
            width: '100%',
            height: '100%'
          }}
          title={bannerConfig.title}
        />
      </div>
      
      {/* 쿠팡 파트너스 수수료 안내 문구 */}
      <div 
        style={{
          padding: '4px 6px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          fontSize: isMobile ? '8px' : '10px',
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

export default CoupangHorizontalBanner;
