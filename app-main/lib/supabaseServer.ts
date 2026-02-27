import { createClient } from '@supabase/supabase-js';

// 싱글톤 패턴으로 변경: 호출되는 시점에 환경 변수를 읽습니다.
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // 테스트 시점에 여기서 로그를 찍어보면 확실히 알 수 있습니다.
    console.error("❌ 현재 환경 변수 상태:", { url, key });
    throw new Error("Supabase 환경 변수가 없습니다. .env 파일을 확인하세요.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

// 기존 코드와의 호환성을 위해 export
export const supabaseAdmin = getSupabaseAdmin();