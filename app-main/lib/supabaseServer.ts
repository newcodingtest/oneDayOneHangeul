import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;
const bucket = process.env.SUPABASE_TTS_BUCKET ?? "tts";

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // 서버에서는 세션 유지가 필요 없으므로 false
    autoRefreshToken: false,
  },
})

/**
 * storage에 존재하는지 검사하는 함수 
 *
 */
export async function existsInStorage(objectPath: string): Promise<boolean> {
  const supabase = supabaseServer;

  const lastSlash = objectPath.lastIndexOf("/");
  const folder = lastSlash >= 0 ? objectPath.slice(0, lastSlash) : "";
  const file = lastSlash >= 0 ? objectPath.slice(lastSlash + 1) : objectPath;

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
    search: file,
  });

  if (error) return false;
  return (data ?? []).some((x) => x.name === file);
}

/**
 * mp3 파일을 storage에 저장하는 함수 
 *
 */
export async function uploadMp3ToSupabase(objectPath: string, buffer: Buffer) {
  const supabase = supabaseServer;

  const { data, error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType: "audio/mpeg",
    upsert: true,
    cacheControl: "31536000", //1년
  });
  console.log("[upload data]: ", data);
  console.log("[upload error]: ", error);
  if (error) throw error;
}