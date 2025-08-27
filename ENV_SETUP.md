# 환경 변수 설정 가이드

## 카카오맵 API 키 설정

### 1. 로컬 개발 환경

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
VITE_KAKAO_JS_KEY=cf29dccdc1b81db907bf3cab84679703
```

### 2. 프로덕션 환경 (Vercel)

Vercel 대시보드에서 환경 변수를 설정하세요:

1. 프로젝트 설정 → Environment Variables
2. `VITE_KAKAO_JS_KEY` 추가
3. 값: `cf29dccdc1b81db907bf3cab84679703`
4. Production, Preview, Development 모두 체크

### 3. 보안 주의사항

- `.env.local` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)
- 프로덕션 환경에서는 환경 변수를 통해 API 키를 관리하세요
- API 키를 코드에 직접 하드코딩하지 마세요

### 4. 환경 변수 확인

환경 변수가 제대로 설정되었는지 확인하려면:

```bash
# 로컬에서 확인
cat .env.local

# Vercel에서 확인
vercel env ls
```

## 문제 해결

### API 키가 인식되지 않는 경우

1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 파일명이 정확한지 확인 (`.env.local`)
3. 개발 서버 재시작
4. Vercel 재배포

### 빌드 오류가 발생하는 경우

1. 환경 변수 이름이 `VITE_`로 시작하는지 확인
2. 값에 공백이나 특수문자가 없는지 확인
3. `.env.local` 파일의 형식이 올바른지 확인
