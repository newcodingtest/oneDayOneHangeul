import { supabaseAdmin } from '@/lib/supabaseServer';


export const grammarRepository = {
  async save(content: string){
    console.log('쿼리 까지는 들어왔어: ', content);
    const {data, error} = await supabaseAdmin
    .from('ko_grammer')
    .insert([
      {
        content: content
      }
    ])
    .select()
    .single();

    if(error){
      console.log('DB 저장 실패: ', error.message);
      return { success: false, error};
    }
    console.log('DB 저장 성공: ', data);
    return { success: true, data};
  }
}
