import { useState, useEffect, useMemo } from 'react';

const GG_KEY = import.meta.env.VITE_GG_KEY || "your_gg_api_key_here";

export const useStores = () => {
  const [stores, setStores] = useState([]);
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

  // Python FastAPI 백엔드를 통한 카카오맵 업체 이미지 조회
  const fetchStoreImage = async (storeName, lat, lng) => {
    // Python 백엔드가 없으므로 바로 기본 이미지 사용
    console.log(`🖼️ ${storeName}: 기본 이미지 사용 (Python 백엔드 비활성화)`);
    return `https://picsum.photos/seed/${encodeURIComponent(storeName)}/400/300`;
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
      
      // 기본 업체 정보만 먼저 생성 (이미지 없이)
      const basicStores = rows
        .filter(r => r.REFINE_WGS84_LAT && r.REFINE_WGS84_LOGT)
        .map((r, index) => {
          const rawCategory = r.INDUTY_CODE_SE_NM || r.INDUTY_CODE_SE || '';
          const storeName = r.CMPNM_NM || '';
          const category = mapIndustryToCategory(rawCategory + ' ' + storeName);
          
          return {
            id: `${r.SIGUN_CD || ''}-${r.MGTNO || r.CMPNM_NM || 'unknown'}-${r.REFINE_WGS84_LAT}-${r.REFINE_WGS84_LOGT}-${index}`,
            name: r.CMPNM_NM,
            address: r.REFINE_ROADNM_ADDR || r.REFINE_LOTNO_ADDR || '',
            lat: +r.REFINE_WGS84_LAT,
            lng: +r.REFINE_WGS84_LOGT,
            rawCategory: rawCategory,
            category: category,
            photo: `https://picsum.photos/seed/${encodeURIComponent(storeName)}/400/300`, // 기본 이미지로 시작
            openNow: null, // TODO: Kakao Local REST로 영업시간 조회 필요
          };
        });
      
      // 기본 업체 정보를 먼저 반환 (빠른 화면 렌더링을 위해)
      console.log(`✅ ${city} 기본 업체 정보 ${basicStores.length}개 생성 완료`);
      
      // 이미지는 백그라운드에서 비동기로 로드
      setTimeout(async () => {
        try {
          console.log(`🔄 ${city} 이미지 로딩 시작 (백그라운드)`);
          
          // 이미지 로딩을 병렬로 처리 (최대 5개씩)
          const batchSize = 5;
          for (let i = 0; i < basicStores.length; i += batchSize) {
            const batch = basicStores.slice(i, i + batchSize);
            await Promise.all(
              batch.map(async (store) => {
                try {
                  const photo = await fetchStoreImage(store.name, store.lat, store.lng);
                  store.photo = photo;
                  console.log(`✅ ${store.name} 이미지 로딩 완료`);
                } catch (error) {
                  console.warn(`⚠️ ${store.name} 이미지 로딩 실패, 기본 이미지 유지`);
                }
              })
            );
            
            // 배치 처리 후 잠시 대기 (서버 부하 방지)
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          console.log(`✅ ${city} 모든 이미지 로딩 완료`);
          
          // 이미지가 로드된 업체 정보로 상태 업데이트
          setStores(prevStores => {
            const updatedStores = prevStores.map(prevStore => {
              const updatedStore = basicStores.find(s => s.id === prevStore.id);
              return updatedStore || prevStore;
            });
            return updatedStores;
          });
          
        } catch (error) {
          console.error(`❌ ${city} 이미지 로딩 중 오류:`, error);
        }
      }, 100);
      
      return basicStores;
    } catch (error) {
      console.error('가게 정보 조회 실패:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 도시별 가게 정보 로드
  const loadStoresByCity = async (city) => {
    setLoading(true);
    try {
      const pages = await Promise.all([1, 2, 3].map(p => fetchGgStoresByCity(city, p, 100)));
      const all = pages.flat();
      setStores(all);
      return all; // 로드된 업체 정보 반환
    } catch (error) {
      console.error('도시별 가게 정보 로드 실패:', error);
      return []; // 에러 시 빈 배열 반환
    } finally {
      setLoading(false);
    }
  };

  return {
    stores,
    loading,
    loadStoresByCity
  };
};
