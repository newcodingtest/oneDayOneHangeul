import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

console.log('Dotenv 로드 결과:', process.env.NEXT_PUBLIC_SUPABASE_URL);

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()
  ],
  test: {
    environment: 'jsdom',
    globals: true, // 이 설정을 하면 테스트 파일에서 'describe', 'it', 'expect'를 매번 import 안 해도 됨
    setupFiles: [path.resolve(__dirname, './vitest.setup.ts')],
  },
})