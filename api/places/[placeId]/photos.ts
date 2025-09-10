import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DETAILS = 'https://maps.googleapis.com/maps/api/place/details/json';
const PHOTO = 'https://maps.googleapis.com/maps/api/place/photo';

// 간단한 메모리 캐시 (실제 운영에서는 Redis 등 사용)
const cache = new Map();
const CACHE_TTL = 25 * 24 * 60 * 60 * 1000; // 25일 (30일보다 짧게)

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
    const { placeId } = req.query as { placeId: string };

    if (!placeId) {
      return res.status(400).json({ error: 'Place ID is required' });
    }

    if (!GOOGLE_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    // 캐시 확인
    const cacheKey = `photos:${placeId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 캐시 히트: ${placeId}`);
      return res.json(cached.data);
    }

    // Place Details API로 사진 메타데이터 가져오기
    const detailsUrl = `${DETAILS}?place_id=${placeId}&fields=photos,name,formatted_address&key=${GOOGLE_KEY}&language=ko`;

    console.log(`🖼️ Google Places Details 호출: ${placeId}`);

    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      throw new Error(`Google Places Details API failed: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK' || !detailsData.result) {
      throw new Error(`Google Places Details API error: ${detailsData.status}`);
    }

    const photos = (detailsData.result.photos || []).slice(0, 6).map((photo: any, index: number) => ({
      index,
      width: photo.width,
      height: photo.height,
      attributions: photo.html_attributions?.join(' ') || '',
      // Place Photos API URL 생성 (클라이언트에서 직접 호출)
      url: `${PHOTO}?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_KEY}`,
      // 서버 프록시 URL (필요시 사용)
      proxyUrl: `/api/places/photo-proxy?reference=${photo.photo_reference}&maxwidth=800`
    }));

    const result = {
      photos,
      placeName: detailsData.result.name,
      placeAddress: detailsData.result.formatted_address,
      fetchedAt: new Date().toISOString()
    };

    // 캐시 저장
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.log(`✅ ${placeId} 사진 정보 로딩 완료: ${photos.length}개`);

    return res.json(result);

  } catch (error) {
    console.error('❌ 사진 정보 로딩 오류:', error);
    return res.status(500).json({ 
      error: 'INTERNAL_ERROR',
      message: error.message 
    });
  }
}
