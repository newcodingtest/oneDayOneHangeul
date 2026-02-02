// app/api/grammar/route.ts
import { GrammarLesson } from "@/types/grammer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// ✅ 서버 캐시 유효 시간 설정 (단위: 초)
// 86400초 = 24시간
export const revalidate = 86400;
export const dynamic = 'force-static'; // 이 파일은 무조건 정적 결과물로 취급해!

export const askGemini = async (prompt: string) => {
  console.log("gemini model: ", process.env.GEMINI_MODEL as string);
  try {
    // 2. 모델 선택 (gemini-1.5-flash가 빠르고 무료 할당량이 많습니다)
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL as string,
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 2000, // 기존보다 크게 설정 (예: 2000)
      }
    });
 
    const result = await model.generateContent(prompt);
    
    // 3. 콘텐츠 생성
    
    const response = await result.response;
  console.log("1. 텍스트 내용:", response.text());
  console.log("2. 종료 사유 (예: STOP, MAX_TOKENS):", response.candidates?.[0].finishReason);
  console.log("3. 토큰 사용량:", response.usageMetadata);
    return response.text();
  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
  }
};

  // 샘플 데이터
  let sampleLesson: GrammarLesson = {
    "date": "2026 2월 2일",
    "day": 2,
    "sentence": "제 가방은 지금 교실에 있어요.",
    "sentenceTranslation": "My bag is in the classroom right now.",
    "grammarTitle": "-에 있어요/없어요 (To be / Not to be at [Location])",
    "grammarExplanation": "This grammar pattern is used to express the location of a person or an object. '-에' is a particle attached to a place noun, and '있어요' or '없어요' indicates whether the subject exists at that location or not.",
    "structure": "Noun (Place) + -에 있어요/없어요",
    "examples": [
      {
        "id": 1,
        "text": "동생은 지금 집에 있어요.",
        "translation": "My younger sibling is at home now."
      },
      {
        "id": 2,
        "text": "책상 위에 지갑이 없어요.",
        "translation": "There is no wallet on the desk."
      },
      {
        "id": 3,
        "text": "민수 씨는 지금 사무실에 있어요?",
        "translation": "Is Minsu in the office right now?"
      },
      {
        "id": 4,
        "text": "냉장고 안에 우유가 많이 있어요.",
        "translation": "There is a lot of milk inside the refrigerator."
      }
    ]
  };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const years: number = now.getFullYear();
  console.log("years: ", years);
  const month: number = now.getMonth() + 1; // 0~11로 반환되므로 +1 필수
  const day: number = now.getDate();        // 1~31일 반환
  
   console.log("get month: ", month);
  console.log("get day: ", day);
  try {
    const prompt = `당신은 외국인을 위한 한국어 교육 전문가(KSL/KFL Expert)입니다. 
한국어를 배우는 외국인 학습자를 위해 Day ${day}에 해당하는 '오늘의 문장' 학습 콘텐츠를 생성해주세요.

다음 JSON 형식으로만 응답해주세요 (다른 설명 없이 JSON만):

{
  "date": "${years} ${month}월 ${day}일",
  "day": ${day},
  "sentence": "한국어 예시 문장 (해당 문법이 자연스럽게 포함된 실생활 문장)",
  "sentenceTranslation": "English translation of the main sentence",
  "grammarTitle": "Grammar Name (Korean and English, e.g., -아/어서 (Because))",
  "grammarExplanation": "Detailed explanation of the grammar in English (2-3 sentences). Focus on 'how' and 'when' to use it.",
  "structure": "Grammar structure/formula (e.g., Verb/Adjective + -아/어서)",
  "examples": [
    {
      "id": 1,
      "text": "Korean example sentence 1",
      "translation": "English translation 1"
    },
    {
      "id": 2,
      "text": "Korean example sentence 2",
      "translation": "English translation 2"
    },
    {
      "id": 3,
      "text": "Korean example sentence 3",
      "translation": "English translation 3"
    },
    {
      "id": 4,
      "text": "Korean example sentence 4",
      "translation": "English translation 4"
    }
  ]
}

중요 지침:
1. Target Audience: 한국어를 배우는 외국인 (설명은 영어로 작성).
2. Content: 매일 다른 문법(조사, 어미, 연결어미 등)을 다뤄주세요.
3. Naturalness: 교과서적인 문장보다는 실제 한국인들이 일상에서 사용하는 자연스러운 구어체나 문어체를 적절히 섞어주세요.
4. Difficulty: Day ${day}가 커질수록 기초 조사에서 복잡한 연결어미로 난이도를 점진적으로 높여주세요.
5. Formatting: 반드시 유효한 JSON 형식이어야 하며, 텍스트 내에 줄바꿈(\n)이 필요할 경우 JSON 규칙을 준수하세요.`;

 
    let response : string = "";
    const deployLevel: string = process.env.DEPLOY_LEVEL || 'dev';
    if(deployLevel === 'prod'){
      console.log("실제 api 요청한다");
      const aiResponse = await askGemini(prompt);
      response = aiResponse ?? JSON.stringify(sampleLesson);
    } else if(deployLevel === 'dev'){
      console.log("샘플 api 요청한다");
      response = JSON.stringify(sampleLesson);
    }

    console.log("response: ", response);
    const data = response;
    
    // JSON 파싱 (```json 제거)
    const cleanContent = data.replace(/```json\n?|\n?```/g, '').trim();
    const grammarData = JSON.parse(cleanContent);
    sampleLesson = grammarData;

    return NextResponse.json(grammarData);

  } catch (error) {
    console.error('Grammar generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate grammar content' },
      { status: 500 }
    );
  }
}