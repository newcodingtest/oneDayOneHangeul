// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 'daily-grammar' 태그를 가진 모든 캐시를 즉시 삭제
(revalidateTag as unknown as (tag: string) => void)('daily-grammar');
  
  revalidatePath('/v1', 'page');
  // 2. 서버가 스스로 본인 페이지를 '방문'하여 캐시 새로 생성 (Warm-up)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 중요: 이 fetch가 실행되면서 새로운 데이터를 가져오고 TTS까지 미리 구워집니다.
  await fetch(`${baseUrl}/v1`, { 
    method: 'GET',
    cache: 'no-store' // 캐시를 타지 않고 새 페이지를 그리도록 강제
  });

  return NextResponse.json({ revalidated: true, now: Date.now() });
}