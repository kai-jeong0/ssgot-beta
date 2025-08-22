import React from 'react';

const Header = React.forwardRef(({ 
  mode, 
  searchName, 
  setSearchName, 
  onBack, 
  category, 
  setCategory
}, ref) => {
  const CATS = [
    { id: "all", label: "전체" },
    { id: "restaurant", label: "음식점" },
    { id: "cafe", label: "카페" },
    { id: "pharmacy", label: "약국" },
    { id: "mart", label: "마트" },
    { id: "beauty", label: "미용" },
    { id: "etc", label: "기타" },
  ];

  return (
    <header className="header" ref={ref}>
      <div className="bar">
        {mode === 'map' && (
          <button className="icon-btn" onClick={onBack} aria-label="뒤로가기">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path d="M15 6l-6 6 6 6" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        {mode === 'map' ? null : (
          <div className="brand">
            쓰곳
            <div style={{fontSize:12,color:'#888',marginTop:4}}>지역화폐 쓰는 곳</div>
          </div>
        )}
        
        {mode === 'map' && (
          <div className="search-container">
            <div className="search">
              <input
                placeholder="런던 베이글 뮤지엄"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchName(e.currentTarget.value)}
              />
              <button className="search-btn" onClick={() => setSearchName(searchName)} aria-label="검색">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {mode === 'map' && (
        <div className="chips">
          {CATS.map(cat => (
            <div
              key={cat.id}
              className={`chip ${category === cat.id ? 'chip--active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </div>
          ))}
        </div>
      )}
    </header>
  );
});

export default Header;
