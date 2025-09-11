import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Clock, Star, Camera, Loader2 } from 'lucide-react';

const PlaceDetailView = ({ store, onClose, isOpen }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attributionVisible, setAttributionVisible] = useState(false);

  // Google Places 사진 로딩
  useEffect(() => {
    if (!isOpen || !store) return;

    const loadGooglePhotos = async () => {
      setLoading(true);
      setError(null);
      setPhotos([]);

      try {
        console.log('🔍 Google Places 사진 로딩 시작:', store.name);
        
        // 환경에 따라 다른 API 사용
        const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
        
        if (isProduction) {
          // 프로덕션 환경: Vercel Functions 사용
          console.log('🚀 프로덕션 환경 - Vercel Functions 사용');
          
          // 1. 업체 매칭
          const matchResponse = await fetch('/api/places/match', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: store.name,
              address: store.address,
              phone: store.phone,
              lat: store.lat,
              lng: store.lng
            })
          });
          
          if (!matchResponse.ok) {
            throw new Error(`매칭 API 실패: ${matchResponse.status}`);
          }
          
          const matchData = await matchResponse.json();
          console.log('✅ 매칭 결과:', matchData);
          
          if (!matchData.place_id) {
            throw new Error('Google Places에서 해당 업체를 찾을 수 없습니다');
          }
          
          // 2. 사진 정보 가져오기
          const photosResponse = await fetch(`/api/places/${matchData.place_id}/photos`);
          
          if (!photosResponse.ok) {
            throw new Error(`사진 API 실패: ${photosResponse.status}`);
          }
          
          const photosData = await photosResponse.json();
          console.log('📸 사진 데이터:', photosData);
          
          setPhotos(photosData.photos || []);
          setAttribution('© Google');
          
        } else {
          // 개발 환경: 직접 API 호출 (CORS 문제 발생 가능)
          console.log('🔧 개발 환경 - 직접 API 호출');
          
          // 실제 Google Places API 호출 시도
          const GOOGLE_KEY = 'AIzaSyCUc8tN3LM7lSH4eqyn1xImxCdwF2n8kqk';
          
          // 1. 업체 매칭 (Google Places에서 해당 업체 찾기)
          const query = [store.name, store.address].filter(Boolean).join(' ');
          const location = store.lat && store.lng ? `&location=${store.lat},${store.lng}&radius=1000` : '';
          
          const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}${location}&key=${GOOGLE_KEY}&region=KR&language=ko`;
          
          console.log('🌐 Google Places 검색:', searchUrl);
          
          // CORS 문제를 우회하기 위해 fetch 옵션 추가
          const searchResponse = await fetch(searchUrl, {
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
            }
          });

          console.log('📡 검색 API 응답:', {
            status: searchResponse.status,
            statusText: searchResponse.statusText,
            ok: searchResponse.ok
          });

          if (!searchResponse.ok) {
            throw new Error(`Google Places API 실패: ${searchResponse.status} ${searchResponse.statusText}`);
          }

          const searchData = await searchResponse.json();
          console.log('📊 검색 결과:', searchData);
          
          if (searchData.status !== 'OK' || !searchData.results?.length) {
            throw new Error('Google Places에서 해당 업체를 찾을 수 없습니다');
          }

          const bestMatch = searchData.results[0];
          console.log('✅ 매칭된 업체:', bestMatch.name);

          // 2. Place Details API로 사진 정보 가져오기
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${bestMatch.place_id}&fields=photos,name,formatted_address&key=${GOOGLE_KEY}&language=ko`;
          
          console.log('🖼️ Place Details 호출:', detailsUrl);
          const detailsResponse = await fetch(detailsUrl, {
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
            }
          });
          
          console.log('📡 Details API 응답:', {
            status: detailsResponse.status,
            statusText: detailsResponse.statusText,
            ok: detailsResponse.ok
          });
          
          if (!detailsResponse.ok) {
            throw new Error(`Place Details API 실패: ${detailsResponse.status} ${detailsResponse.statusText}`);
          }

          const detailsData = await detailsResponse.json();
          console.log('📸 Details 데이터:', detailsData);
          
          if (detailsData.status !== 'OK' || !detailsData.result) {
            throw new Error('Place Details API 오류');
          }

          // 3. 사진 URL 생성
          const photos = (detailsData.result.photos || []).slice(0, 6).map((photo, index) => ({
            index,
            width: photo.width,
            height: photo.height,
            attributions: photo.html_attributions?.join(' ') || '',
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_KEY}`
          }));

          console.log('🖼️ 생성된 사진들:', photos);
          
          setPhotos(photos);
          setAttributionVisible(true);
        }

      } catch (err) {
        console.error('❌ Google Places 사진 로딩 실패:', err);
        console.log('⚠️ API 실패로 인해 더미 데이터 사용');
        
        // CORS 실패 시 더미 데이터 사용
        const dummyPhotos = [
          {
            index: 0,
            width: 800,
            height: 600,
            attributions: 'Google Places (더미 데이터)',
            url: `https://picsum.photos/seed/${encodeURIComponent(store.name)}/800/600`
          },
          {
            index: 1,
            width: 800,
            height: 600,
            attributions: 'Google Places (더미 데이터)',
            url: `https://picsum.photos/seed/${encodeURIComponent(store.name + '2')}/800/600`
          },
          {
            index: 2,
            width: 800,
            height: 600,
            attributions: 'Google Places (더미 데이터)',
            url: `https://picsum.photos/seed/${encodeURIComponent(store.name + '3')}/800/600`
          }
        ];

        console.log('🖼️ 더미 사진 데이터 생성:', dummyPhotos);
        
        setPhotos(dummyPhotos);
        setAttributionVisible(true);
        setError('CORS 문제로 인해 더미 데이터를 사용합니다. 프로덕션에서는 서버 프록시를 통해 실제 Google Places 데이터를 사용합니다.');
      } finally {
        setLoading(false);
      }
    };

    // Feature flag 확인
    const enableGooglePhotos = import.meta.env.VITE_ENABLE_GOOGLE_PHOTOS === 'true';
    
    if (enableGooglePhotos) {
      loadGooglePhotos();
    } else {
      // Feature flag가 비활성화된 경우 더미 데이터 사용 (개발 테스트용)
      console.log('🔧 Feature flag 비활성화 - 더미 데이터 사용');
      setPhotos([
        {
          url: 'https://picsum.photos/seed/' + encodeURIComponent(store.name) + '/400/300',
          width: 400,
          height: 300,
          attributions: '개발 테스트 이미지'
        },
        {
          url: 'https://picsum.photos/seed/' + encodeURIComponent(store.name + '2') + '/400/300',
          width: 400,
          height: 300,
          attributions: '개발 테스트 이미지'
        },
        {
          url: 'https://picsum.photos/seed/' + encodeURIComponent(store.name + '3') + '/400/300',
          width: 400,
          height: 300,
          attributions: '개발 테스트 이미지'
        }
      ]);
      setAttributionVisible(true);
      setLoading(false);
    }
  }, [isOpen, store]);

  if (!isOpen || !store) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Google Attribution (필수) */}
          {attributionVisible && (
            <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>이미지 & 데이터 제공: © Google</span>
              </div>
            </div>
          )}

          {/* 사진 그리드 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              사진
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="text-gray-600">Google Places에서 사진을 불러오는 중...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-2">{error}</p>
                <p className="text-xs text-gray-500">기본 이미지를 표시합니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.url}
                      alt={`${store.name} 사진 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/assets/marker-default.svg';
                      }}
                    />
                    {photo.attributions && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        {photo.attributions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 업체 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">업체 정보</h3>
            
            <div className="space-y-3">
              {store.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">주소</p>
                    <p className="text-sm text-gray-600">{store.address}</p>
                  </div>
                </div>
              )}

              {store.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">전화번호</p>
                    <p className="text-sm text-gray-600">{store.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">영업상태</p>
                  <p className="text-sm text-gray-600">정보없음</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">카테고리</p>
                  <p className="text-sm text-gray-600">{store.category || '정보없음'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailView;
