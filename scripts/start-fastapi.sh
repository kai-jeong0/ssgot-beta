#!/bin/bash

# Python FastAPI 서버 실행 스크립트

echo "🚀 Python FastAPI 서버 시작 중..."

# 필요한 Python 패키지 설치 확인
echo "📦 Python 패키지 설치 확인 중..."
pip install fastapi uvicorn selenium beautifulsoup4 requests

# FastAPI 서버 실행
echo "🌐 FastAPI 서버를 http://localhost:8000 에서 실행 중..."
cd "$(dirname "$0")/.."
python -m uvicorn kakao_image_api:app --host 0.0.0.0 --port 8000 --reload

echo "✅ FastAPI 서버가 시작되었습니다!"
echo "📱 프론트엔드에서 http://localhost:8000/image?keyword=업체명 으로 접근 가능합니다."
