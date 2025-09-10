import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const TEXT_SEARCH = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

// 업체 매칭을 위한 정규화 함수
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거
    .replace(/\s+/g, ' ') // 연속 공백을 하나로
    .trim();
}

// 매칭 점수 계산
function calculateMatchScore(store: any, candidate: any): number {
  let score = 0;
  
  // 이름 매칭 (가중치 0.5)
  if (store.name && candidate.name) {
    const storeName = normalizeText(store.name);
    const candidateName = normalizeText(candidate.name);
    
    if (storeName === candidateName) {
      score += 0.5;
    } else if (candidateName.includes(storeName) || storeName.includes(candidateName)) {
      score += 0.3;
    }
  }
  
  // 전화번호 매칭 (가중치 0.3)
  if (store.phone && candidate.formatted_phone_number) {
    const storePhone = store.phone.replace(/[^\d]/g, '');
    const candidatePhone = candidate.formatted_phone_number.replace(/[^\d]/g, '');
    
    if (storePhone === candidatePhone) {
      score += 0.3;
    }
  }
  
  // 주소 매칭 (가중치 0.2)
  if (store.address && candidate.formatted_address) {
    const storeAddr = normalizeText(store.address);
    const candidateAddr = normalizeText(candidate.formatted_address);
    
    // 주소 토큰 겹침 확인
    const storeTokens = storeAddr.split(' ');
    const candidateTokens = candidateAddr.split(' ');
    const commonTokens = storeTokens.filter(token => 
      candidateTokens.some(cToken => cToken.includes(token) || token.includes(cToken))
    );
    
    if (commonTokens.length > 0) {
      score += 0.2 * (commonTokens.length / storeTokens.length);
    }
  }
  
  // 좌표 거리 보너스 (가중치 0.2)
  if (store.lat && store.lng && candidate.geometry?.location) {
    const distance = calculateDistance(
      parseFloat(store.lat),
      parseFloat(store.lng),
      candidate.geometry.location.lat,
      candidate.geometry.location.lng
    );
    
    if (distance <= 300) { // 300m 이내
      score += 0.2;
    }
  }
  
  return score;
}

// 거리 계산 (미터)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, address, phone, lat, lng } = req.query as Record<string, string>;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!GOOGLE_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    // 검색 쿼리 구성
    const queryParts = [name];
    if (address) queryParts.push(address);
    
    const query = queryParts.join(' ');
    const location = lat && lng ? `&location=${lat},${lng}&radius=1000` : '';
    
    const searchUrl = `${TEXT_SEARCH}?query=${encodeURIComponent(query)}${location}&key=${GOOGLE_KEY}&region=KR&language=ko`;

    console.log(`🔍 Google Places 검색: ${searchUrl}`);

    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`Google Places API failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || !searchData.results?.length) {
      return res.status(404).json({ 
        error: 'NO_MATCH',
        message: 'Google Places에서 해당 업체를 찾을 수 없습니다'
      });
    }

    // 매칭 점수 계산 및 최적 후보 선택
    const store = { name, address, phone, lat, lng };
    let bestMatch = null;
    let bestScore = 0;

    for (const candidate of searchData.results) {
      const score = calculateMatchScore(store, candidate);
      console.log(`📊 ${candidate.name} 매칭 점수: ${score.toFixed(2)}`);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    // 임계값 확인 (0.7 이상이면 채택)
    if (bestScore < 0.7) {
      return res.status(404).json({ 
        error: 'LOW_CONFIDENCE',
        message: `매칭 신뢰도가 낮습니다 (${bestScore.toFixed(2)})`,
        confidence: bestScore
      });
    }

    console.log(`✅ 최적 매칭: ${bestMatch.name} (점수: ${bestScore.toFixed(2)})`);

    return res.json({
      placeId: bestMatch.place_id,
      confidence: bestScore,
      name: bestMatch.name,
      address: bestMatch.formatted_address,
      phone: bestMatch.formatted_phone_number,
      rating: bestMatch.rating,
      matchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 업체 매칭 오류:', error);
    return res.status(500).json({ 
      error: 'INTERNAL_ERROR',
      message: error.message 
    });
  }
}
