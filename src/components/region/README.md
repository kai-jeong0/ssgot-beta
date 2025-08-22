# RegionPickerGyeonggi 컴포넌트

네이버 부동산 스타일의 경기도 지역 선택 UI 컴포넌트입니다.

## 개요

경기도 31개 시·군을 **지도형**과 **목록형** 두 가지 방식으로 선택할 수 있는 독립 컴포넌트입니다.
기존 프로젝트 구조를 건드리지 않고 최소 침습으로 통합되었습니다.

## 주요 기능

### 🗺️ 지도형 선택
- 경기도를 6개 권역으로 단순화한 SVG 지도
- 권역별 호버 효과 및 클릭 선택
- 각 권역의 대표 도시로 자동 선택
- 접근성: 키보드 포커스, aria-label 지원

### 📋 목록형 선택  
- 경기도 31개 시·군 전체 목록
- 실시간 검색 필터링
- 그리드 레이아웃 (2열)
- 선택 상태 시각적 피드백

### ♿ 접근성
- 키보드 탐색 지원 (Tab, Shift+Tab)
- ARIA 라벨 제공
- 스크린 리더 호환

### 📱 반응형
- 모바일~데스크톱 대응
- 360px부터 6xl까지 레이아웃 최적화

## 사용법

```jsx
import RegionPickerGyeonggi from './components/region/RegionPickerGyeonggi';

function App() {
  const handleCitySelect = (city) => {
    console.log('선택된 도시:', city);
    // { id: 'suwon', label: '수원시' }
  };

  return (
    <RegionPickerGyeonggi 
      onSelectCity={handleCitySelect}
      className="custom-class"
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSelectCity` | `(city: { id: string; label: string }) => void` | ❌ | 도시 선택 시 호출되는 콜백 |
| `className` | `string` | ❌ | 추가 CSS 클래스 |

## 데이터 구조

### 도시 정보
```javascript
{
  id: 'suwon',        // 영문 슬러그 (kebab-case)
  label: '수원시',     // 표시명
  zone: 'central'     // 권역 분류
}
```

### 권역 분류
- `central`: 중부권 (수원, 성남, 용인 등 12개)
- `northwest`: 서북부권 (고양, 김포, 파주 3개)
- `northeast`: 동북부권 (남양주, 포천, 구리, 가평 4개)
- `southwest`: 서남부권 (안산, 화성, 평택, 시흥 4개)
- `southeast`: 동남부권 (이천, 안성, 여주, 양평 4개)
- `north`: 북부권 (의정부, 양주, 동두천, 연천 4개)

## 통합 방식

기존 `App.jsx`에 feature flag로 통합:

```jsx
// Feature flag for new region picker
const enableGyeonggiPicker = true;

{mode === 'region' && (
  <>
    {enableGyeonggiPicker ? (
      <RegionPickerGyeonggi onSelectCity={handleCitySelect} />
    ) : (
      <RegionGrid onCitySelect={enterCity} />
    )}
  </>
)}
```

## 로드맵 (Phase 계획)

### ✅ Phase 1 (현재)
- 단순화된 SVG 기반 지도 히트존
- 31개 시·군 하드코딩 데이터
- 기본 검색 및 선택 기능

### 🔄 Phase 2 (향후)
- 실제 지도 API 통합 (네이버/카카오/Leaflet)
- 줌/팬 가능한 인터랙티브 지도
- 서버/환경 변수에서 도시 데이터 주입
- 행정경계 정확도 향상

## 제약사항

- **기존 구조 보존**: 라우팅, 전역 상태, 디자인 토큰 변경 없음
- **독립성**: 컴포넌트 단독으로 동작, 외부 의존성 최소화
- **호환성**: 기존 `enterCity` 함수와 완전 호환

## 환경

- **React**: 함수형 컴포넌트
- **스타일링**: Tailwind CSS만 사용
- **접근성**: WAI-ARIA 가이드라인 준수
- **번들 크기**: 최소화 (하드코딩 데이터, 외부 라이브러리 없음)

## 문의

개발자: kai.jeong0@gmail.com
