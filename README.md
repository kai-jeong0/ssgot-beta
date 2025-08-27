# 쓰곳 (SSGOT) - 지역화폐 사용처 찾기 서비스

지역화폐를 사용할 수 있는 업체들을 지도에서 찾고, 상세 정보를 확인할 수 있는 웹 서비스입니다.

## 🚀 주요 기능

- **지역 선택**: 경기도 31개 시군구 중 선택
- **지도 기반 검색**: 카카오맵을 통한 업체 위치 확인
- **카테고리별 필터링**: 음식점, 카페, 약국, 마트, 미용 등
- **업체 상세 정보**: 실제 업체 이미지, 주소, 길찾기
- **실시간 검색**: 업체명 기반 실시간 검색

## 🛠️ 기술 스택

### Frontend
- **React 18** + **Vite** - 빠른 개발 환경
- **Tailwind CSS** - 모던한 UI 디자인
- **Kakao Maps API** - 지도 및 장소 검색

### Backend (Python FastAPI)
- **FastAPI** - 고성능 Python 웹 프레임워크
- **Selenium** - 카카오맵 웹 스크래핑
- **BeautifulSoup4** - HTML 파싱
- **Chrome WebDriver** - 헤드리스 브라우저

## 📁 프로젝트 구조

```
ssgot-beta/
├── src/                    # React 프론트엔드
│   ├── components/         # UI 컴포넌트
│   ├── hooks/             # 커스텀 훅
│   └── lib/               # 유틸리티 함수
├── public/                 # 정적 파일
│   └── assets/            # 이미지 및 아이콘
├── scripts/                # 실행 스크립트
├── kakao_image_api.py      # Python FastAPI 서버
├── requirements.txt        # Python 의존성
└── README.md              # 프로젝트 문서
```

## 🚀 시작하기

### 1. 프론트엔드 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. Python FastAPI 서버 실행

```bash
# Python 의존성 설치
pip install -r requirements.txt

# FastAPI 서버 실행
./scripts/start-fastapi.sh

# 또는 직접 실행
python kakao_image_api.py
```

### 3. 환경 변수 설정

#### 로컬 개발 환경

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_KAKAO_JS_KEY=cf29dccdc1b81db907bf3cab84679703
```

#### 프로덕션 환경 (Vercel)

Vercel 대시보드에서 환경 변수를 설정하세요:

1. 프로젝트 설정 → Environment Variables
2. `VITE_KAKAO_JS_KEY` 추가
3. 값: `cf29dccdc1b81db907bf3cab84679703`
4. Production, Preview, Development 모두 체크

#### 보안 주의사항

- `.env.local` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)
- 프로덕션 환경에서는 환경 변수를 통해 API 키를 관리하세요
- API 키를 코드에 직접 하드코딩하지 마세요

자세한 설정 방법은 [ENV_SETUP.md](./ENV_SETUP.md)를 참조하세요.

## 🔧 주요 API

### 카카오맵 이미지 API

```
GET /image?keyword=업체명
```

**응답 예시:**
```json
{
  "keyword": "해피약국",
  "place_id": "1234567890",
  "image_url": "https://...",
  "success": true
}
```

## 📱 사용법

1. **지역 선택**: 상단에서 원하는 시군구 선택
2. **지도 탐색**: 지도에서 업체 마커 클릭
3. **카테고리 필터**: 원하는 업종 선택
4. **검색**: 업체명으로 실시간 검색
5. **상세 정보**: 업체 카드 클릭으로 상세 정보 확인

## 🌟 특징

- **모바일 퍼스트**: 360~480px 최적화
- **실시간 이미지**: 카카오맵에서 실제 업체 이미지 로딩
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- **성능 최적화**: 이미지 로딩 및 마커 관리 최적화

## 📄 라이선스

© kai.jeong — Contact: kai.jeong0@gmail.com
