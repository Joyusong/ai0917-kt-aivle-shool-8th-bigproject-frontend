import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 현재 실행 모드(development, production)에 맞는 환경 변수를 불러옵니다.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        // shadcn/ui 및 프로젝트 내부에서 사용하는 절대 경로(@) 설정
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // 1. 네이버 개발자 센터 설정과 일치시키기 위해 5173 포트 고정
      port: 5173,
      // 2. 다른 포트로 자동 전환 방지 (인증 콜백 오류 방지)
      strictPort: true,

      // --- 프록시 설정 ---
      proxy: {
        // 프론트엔드에서 /api로 시작하는 요청을 백엔드로 전달
        '/api': {
          // .env의 VITE_BACKEND_URL을 사용하고, 없을 경우 로컬 백엔드 기본값 사용
          target: env.VITE_BACKEND_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      // Vercel 배포 및 대규모 프로젝트를 위한 빌드 최적화
      chunkSizeWarningLimit: 1600,
      outDir: 'dist',
      // 프로덕션 환경에서 디버깅이 필요한 경우 true로 변경 가능
      sourcemap: false,
    },
  };
});
