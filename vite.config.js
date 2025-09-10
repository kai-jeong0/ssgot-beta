import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 환경 변수 로딩
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('🔧 Vite 설정 로드:', {
    command,
    mode,
    envKeys: Object.keys(env).filter(key => key.startsWith('VITE_')),
    kakaoKey: env.VITE_KAKAO_JS_KEY ? env.VITE_KAKAO_JS_KEY.substring(0, 10) + '...' : 'undefined'
  })

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api/google': {
          target: 'https://maps.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/google/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🔄 프록시 요청:', req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('✅ 프록시 응답:', proxyRes.statusCode);
            });
          }
        }
      }
    },
    define: {
      // 환경 변수를 클라이언트에서 사용할 수 있도록 정의
      __KAKAO_API_KEY__: JSON.stringify(env.VITE_KAKAO_JS_KEY)
    },
    // 환경 변수 파일 우선순위 설정
    envDir: '.',
    envPrefix: 'VITE_'
  }
})
