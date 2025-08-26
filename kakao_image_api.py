from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import requests
import json
import time
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Kakao Image API", description="카카오맵에서 업체 이미지를 가져오는 API")

# CORS 설정 (프론트엔드에서 접근 가능하도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_place_id(keyword: str):
    """카카오맵에서 업체명으로 place ID를 가져옵니다."""
    try:
        logger.info(f"🔍 Place ID 검색 시작: {keyword}")
        
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--allow-running-insecure-content")

        driver = webdriver.Chrome(options=chrome_options)
        driver.get(f"https://map.kakao.com/?q={keyword}")
        time.sleep(3)  # 페이지 로딩 대기 시간 증가

        try:
            iframe = driver.find_element(By.CSS_SELECTOR, "iframe#searchIframe")
            driver.switch_to.frame(iframe)
            time.sleep(2)

            soup = BeautifulSoup(driver.page_source, "html.parser")
            link = soup.select_one("a.moreview")
            
            if not link:
                logger.warning(f"⚠️ {keyword}: moreview 링크를 찾을 수 없음")
                return None

            href = link["href"]
            if "placeId=" in href:
                place_id = href.split("placeId=")[-1].split("&")[0]
                logger.info(f"✅ {keyword}: Place ID 발견 - {place_id}")
                return place_id
            else:
                logger.warning(f"⚠️ {keyword}: placeId 파라미터를 찾을 수 없음")
                return None
                
        except Exception as e:
            logger.error(f"❌ {keyword}: iframe 처리 중 오류 - {e}")
            return None
            
    except Exception as e:
        logger.error(f"❌ {keyword}: Place ID 검색 오류 - {e}")
        return None
    finally:
        try:
            driver.quit()
        except:
            pass

def get_place_image_url(place_id: str):
    """Place ID로 업체의 메인 이미지 URL을 가져옵니다."""
    try:
        logger.info(f"🖼️ 이미지 URL 검색 시작: {place_id}")
        
        url = f"https://place.map.kakao.com/main/v/{place_id}"
        headers = {
            "Referer": "https://place.map.kakao.com/",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            logger.error(f"❌ {place_id}: HTTP 오류 - {response.status_code}")
            return None

        data = response.json()
        
        # 이미지 URL 추출
        if 'basicInfo' in data and 'mainphotourl' in data['basicInfo']:
            image_url = data['basicInfo']['mainphotourl']
            logger.info(f"✅ {place_id}: 이미지 URL 발견 - {image_url}")
            return image_url
        else:
            logger.warning(f"⚠️ {place_id}: basicInfo 또는 mainphotourl을 찾을 수 없음")
            return None
            
    except Exception as e:
        logger.error(f"❌ {place_id}: 이미지 URL 검색 오류 - {e}")
        return None

@app.get("/")
def read_root():
    """API 루트 엔드포인트"""
    return {
        "message": "Kakao Image API",
        "version": "1.0.0",
        "endpoints": {
            "image": "/image?keyword=업체명"
        }
    }

@app.get("/image")
def fetch_kakao_place_image(keyword: str = Query(..., description="검색할 업체명")):
    """업체명으로 카카오맵에서 업체 이미지를 가져옵니다."""
    try:
        logger.info(f"🚀 이미지 검색 요청: {keyword}")
        
        # Place ID 검색
        place_id = get_place_id(keyword)
        if not place_id:
            logger.warning(f"⚠️ {keyword}: Place ID를 찾을 수 없음")
            return {
                "keyword": keyword,
                "place_id": None,
                "image_url": None,
                "error": "장소 ID를 찾을 수 없습니다.",
                "success": False
            }

        # 이미지 URL 검색
        image_url = get_place_image_url(place_id)
        if not image_url:
            logger.warning(f"⚠️ {keyword}: 이미지 URL을 찾을 수 없음")
            return {
                "keyword": keyword,
                "place_id": place_id,
                "image_url": None,
                "error": "업체 이미지를 찾을 수 없습니다.",
                "success": False
            }

        logger.info(f"✅ {keyword}: 이미지 검색 성공")
        return {
            "keyword": keyword,
            "place_id": place_id,
            "image_url": image_url,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"❌ {keyword}: API 처리 오류 - {e}")
        return {
            "keyword": keyword,
            "place_id": None,
            "image_url": None,
            "error": f"서버 오류: {str(e)}",
            "success": False
        }

@app.get("/health")
def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
