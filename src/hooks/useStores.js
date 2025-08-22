import { useState, useEffect, useMemo } from 'react';

const GG_KEY = import.meta.env.VITE_GG_KEY || "your_gg_api_key_here";

export const useStores = () => {
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  // 업종을 카테고리로 매핑
  const mapIndustryToCategory = (name = "") => {
    const n = name.toLowerCase();
    
    if (/(한식|분식|중식|일식|양식|음식|식당|요리|치킨|피자|고기|횟집|레스토랑|식사|밥집|맛집|음식점|외식|식품|음료|술집|호프|바|펍)/.test(name)) {
      return "restaurant";
    }
    
    if (/(카페|coffee|coffe|tea|디저트|베이커리|빵집|제과|제빵|커피|차|음료|스무디|주스|아이스크림|케이크|도넛)/.test(name) || n.includes("카페")) {
      return "cafe";
    }
    
    if (/(약국|pharmacy|약품|의약품|한약|약초|약사|약방|의료|병원|클리닉|진료소)/.test(name)) {
      return "pharmacy";
    }
    
    if (/(마트|슈퍼|식자재|편의점|상점|소매|도매|식품점|식료품|생활용품|잡화|문구|서점|도서|책방)/.test(name)) {
      return "mart";
    }
    
    if (/(미용|이용|헤어|뷰티|네일|화장품|미용실|이발소|네일샵|뷰티샵|화장|메이크업|에스테틱|피부관리|마사지|안마|지압)/.test(name)) {
      return "beauty";
    }
    
    return "etc";
  };

  // 경기도 공공데이터 API로 가게 정보 조회
  const fetchGgStoresByCity = async (city, page = 1, size = 100) => {
    try {
      const url = new URL('https://openapi.gg.go.kr/RegionMnyFacltStus');
      url.searchParams.set('KEY', GG_KEY);
      url.searchParams.set('Type', 'json');
      url.searchParams.set('pIndex', String(page));
      url.searchParams.set('pSize', String(size));
      url.searchParams.set('SIGUN_NM', city);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('GG API error');
      
      const json = await res.json();
      const rows = json?.RegionMnyFacltStus?.[1]?.row ?? [];
      
      return rows
        .filter(r => r.REFINE_WGS84_LAT && r.REFINE_WGS84_LOGT)
        .map(r => {
          const rawCategory = r.INDUTY_CODE_SE_NM || r.INDUTY_CODE_SE || '';
          const storeName = r.CMPNM_NM || '';
          const category = mapIndustryToCategory(rawCategory + ' ' + storeName);
          
          return {
            id: `${r.SIGUN_CD || ''}-${r.MGTNO || r.CMPNM_NM}-${r.REFINE_WGS84_LAT}-${r.REFINE_WGS84_LOGT}`,
            name: r.CMPNM_NM,
            address: r.REFINE_ROADNM_ADDR || r.REFINE_LOTNO_ADDR || '',
            lat: +r.REFINE_WGS84_LAT,
            lng: +r.REFINE_WGS84_LOGT,
            rawCategory: rawCategory,
            category: category,
            photo: `https://picsum.photos/seed/${encodeURIComponent(r.CMPNM_NM)}/400/300`,
            openNow: null, // TODO: Kakao Local REST로 영업시간 조회 필요
          };
        });
    } catch (error) {
      console.error('가게 정보 조회 실패:', error);
      return [];
    }
  };

  // 도시별 가게 정보 로드
  const loadStoresByCity = async (city) => {
    setLoading(true);
    try {
      const pages = await Promise.all([1, 2, 3].map(p => fetchGgStoresByCity(city, p, 100)));
      const all = pages.flat();
      setStores(all);
      setFiltered(all);
    } catch (error) {
      console.error('도시별 가게 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stores,
    filtered,
    loading,
    loadStoresByCity,
    setFiltered
  };
};
