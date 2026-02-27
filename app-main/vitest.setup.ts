// vitest.setup.ts
import { config } from 'dotenv';
import path from 'path';

// .env.test를 강제로 process.env에 할당
config({ path: path.resolve(__dirname, '.env.test') });

console.log('--- Vitest Setup 실행됨 ---');
console.log('로드된 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);