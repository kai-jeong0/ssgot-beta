import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PHOTO = 'https://maps.googleapis.com/maps/api/place/photo';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { reference, maxwidth = '800', maxheight } = req.query as Record<string, string>;

    if (!reference) {
      return res.status(400).json({ error: 'Photo reference is required' });
    }

    if (!GOOGLE_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    // Google Place Photos API URL 구성
    const photoUrl = `${PHOTO}?photo_reference=${reference}&key=${GOOGLE_KEY}`;
    const params = new URLSearchParams();
    params.append('photo_reference', reference);
    params.append('key', GOOGLE_KEY);
    
    if (maxwidth) params.append('maxwidth', maxwidth);
    if (maxheight) params.append('maxheight', maxheight);

    const finalUrl = `${PHOTO}?${params.toString()}`;

    console.log(`🖼️ Google Place Photo 프록시: ${reference}`);

    // Google API에서 이미지 가져오기
    const photoResponse = await fetch(finalUrl);
    
    if (!photoResponse.ok) {
      throw new Error(`Google Place Photos API failed: ${photoResponse.status}`);
    }

    // 이미지 데이터를 클라이언트로 전달
    const imageBuffer = await photoResponse.arrayBuffer();
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24시간 캐시
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('❌ 사진 프록시 오류:', error);
    return res.status(500).json({ 
      error: 'INTERNAL_ERROR',
      message: error.message 
    });
  }
}
