import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

import { supabaseAdmin } from '@/lib/supabaseServer';
import { afterAll, describe, expect, it } from 'vitest';
import { grammarRepository } from './grammarRepository';

console.log('테스트 시작 전 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

describe('supabaseService.save 실제 DB 통합 테스트', () => {
  const TEST_CONTENT = '테스트 코드에서 보낸 실제 데이터입니다.';

  // [옵션] 테스트가 끝난 후 생성된 테스트 데이터를 삭제하여 DB를 깨끗하게 유지
  afterAll(async () => {
    await supabaseAdmin
      .from('ko_grammer')
      .delete()
      .eq('content', TEST_CONTENT);
  });

  it('실제 Supabase DB에 데이터를 저장하고 결과를 반환해야 한다', async () => {
    // 1. 실제 함수 실행
    const result = await grammarRepository.save(TEST_CONTENT);

    // 2. 응답 값 검증
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.content).toBe(TEST_CONTENT);

    // 3. (선택사항) 직접 DB를 다시 조회해서 데이터가 있는지 한 번 더 확인
    const { data } = await supabaseAdmin
      .from('ko_grammer')
      .select()
      .eq('id', result.data?.id)
      .single();

    expect(data).not.toBeNull();
    expect(data?.content).toBe(TEST_CONTENT);
  }, 10000); // 네트워크 통신이므로 타임아웃을 10초로 넉넉히 잡습니다.
});