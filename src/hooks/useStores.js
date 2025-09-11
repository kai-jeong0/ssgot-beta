import { useState, useEffect, useMemo } from 'react';

const GG_KEY = import.meta.env.VITE_GG_KEY || "your_gg_api_key_here";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "your_google_maps_api_key_here";

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

  // 구글맵스 API를 통한 업체 이미지 조회
  const fetchStoreImageFromGoogle = async (storeName, lat, lng) => {
    try {
      console.log(`🔍 구글맵스에서 ${storeName} 검색 중...`);
      
      // 환경에 따라 다른 API 사용
      const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
      
      if (isProduction) {
        // 프로덕션 환경: Vercel Functions 사용
        console.log('🚀 프로덕션 환경 - Vercel Functions 사용');
        
        const matchResponse = await fetch('/api/places/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: storeName,
            address: '',
            phone: '',
            lat: lat,
            lng: lng
          })
        });
        
        if (!matchResponse.ok) {
          console.warn('⚠️ 매칭 API 실패:', matchResponse.status);
          return null;
        }
        
        const matchData = await matchResponse.json();
        
        if (!matchData.place_id) {
          console.warn('⚠️ Google Places에서 해당 업체를 찾을 수 없습니다');
          return null;
        }
        
        // 사진 정보 가져오기
        const photosResponse = await fetch(`/api/places/${matchData.place_id}/photos`);
        
        if (!photosResponse.ok) {
          console.warn('⚠️ 사진 API 실패:', photosResponse.status);
          return null;
        }
        
        const photosData = await photosResponse.json();
        
        if (photosData.photos && photosData.photos.length > 0) {
          return photosData.photos[0].url;
        }
        
        return null;
        
      } else {
        // 개발 환경: 직접 API 호출 (CORS 문제 발생 가능)
        console.log('🔧 개발 환경 - 직접 API 호출');
        console.log(`🔑 구글맵스 API 키: ${GOOGLE_MAPS_API_KEY ? GOOGLE_MAPS_API_KEY.substring(0, 10) + '...' : '없음'}`);
        
        // API 키 확인
        if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
          console.warn('⚠️ 구글맵스 API 키가 설정되지 않음');
          return null;
        }
        
        // 구글맵스 Places API로 업체 검색 (Google Maps API 가이드에 따른 표준 방식)
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(storeName)}&location=${lat},${lng}&radius=1000&key=${GOOGLE_MAPS_API_KEY}`;
        
        console.log(`🌐 구글맵스 API 호출: ${searchUrl}`);
        const searchResponse = await fetch(searchUrl);
        console.log(`📡 구글맵스 API 응답 상태: ${searchResponse.status} ${searchResponse.statusText}`);
        
        if (!searchResponse.ok) {
          throw new Error(`Google Places API search failed: ${searchResponse.status} ${searchResponse.statusText}`);
        }
        
        const searchData = await searchResponse.json();
        console.log(`📊 구글맵스 검색 결과: ${searchData.results ? searchData.results.length : 0}개`);
        
        // API 오류 확인
        if (searchData.error_message) {
          console.warn(`⚠️ 구글맵스 API 오류: ${searchData.error_message}`);
          return null;
        }
        
        if (searchData.results && searchData.results.length > 0) {
          const place = searchData.results[0]; // 가장 관련성 높은 결과 선택
          const placeId = place.place_id;
          
          console.log(`✅ 구글맵스에서 ${storeName} 발견: ${place.name}`);
          
          // Place Details API로 상세 정보 및 사진 가져오기 (Google Maps API 가이드에 따른 표준 방식)
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,name,rating,formatted_address&key=${GOOGLE_MAPS_API_KEY}`;
          
          console.log(`🌐 구글맵스 Details API 호출: ${detailsUrl}`);
          const detailsResponse = await fetch(detailsUrl);
          console.log(`📡 구글맵스 Details API 응답 상태: ${detailsResponse.status} ${detailsResponse.statusText}`);
          
          if (!detailsResponse.ok) {
            throw new Error(`Google Places Details API failed: ${detailsResponse.status} ${detailsResponse.statusText}`);
          }
          
          const detailsData = await detailsResponse.json();
          
          if (detailsData.result && detailsData.result.photos && detailsData.result.photos.length > 0) {
            const photoReference = detailsData.result.photos[0].photo_reference;
            
            // 사진 URL 생성 (Google Maps API 가이드에 따른 표준 방식)
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
            
            console.log(`📸 ${storeName} 구글맵스 이미지 로드 성공`);
            return photoUrl;
          }
        }
        
        console.log(`⚠️ ${storeName} 구글맵스에서 이미지를 찾을 수 없음`);
        return null;
      }
      
    } catch (error) {
      console.warn(`❌ ${storeName} 구글맵스 이미지 로드 실패:`, error.message);
      return null;
    }
  };

  // 업체 이미지 조회 (구글맵스 우선, 실패 시 기본 이미지)
  const fetchStoreImage = async (storeName, lat, lng) => {
    // 구글맵스에서 이미지 시도
    const googleImage = await fetchStoreImageFromGoogle(storeName, lat, lng);
    
    if (googleImage) {
      return googleImage;
    }
    
    // 구글맵스 실패 시 기본 이미지 사용
    console.log(`🖼️ ${storeName}: 기본 이미지 사용 (구글맵스 실패)`);
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
          console.log(`📊 총 ${basicStores.length}개 업체의 이미지 로딩 예정`);
          
          // 이미지 로딩을 병렬로 처리 (최대 3개씩으로 제한하여 API 제한 방지)
          const batchSize = 3;
          for (let i = 0; i < basicStores.length; i += batchSize) {
            const batch = basicStores.slice(i, i + batchSize);
            console.log(`📦 배치 ${Math.floor(i/batchSize) + 1}: ${batch.map(s => s.name).join(', ')}`);
            
            await Promise.all(
              batch.map(async (store) => {
                try {
                  console.log(`🔄 ${store.name} 이미지 로딩 시작...`);
                  const photo = await fetchStoreImage(store.name, store.lat, store.lng);
                  store.photo = photo;
                  console.log(`✅ ${store.name} 이미지 로딩 완료: ${photo}`);
                } catch (error) {
                  console.warn(`⚠️ ${store.name} 이미지 로딩 실패:`, error.message);
                }
              })
            );
            
            // 배치 처리 후 잠시 대기 (API 제한 방지)
            await new Promise(resolve => setTimeout(resolve, 500));
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
