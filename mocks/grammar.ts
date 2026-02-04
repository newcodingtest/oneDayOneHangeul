
export const getSampleLesson = (years: number, month: number, day: number): GrammarLesson => ({
 "date": `${years}년 ${month}월 ${day}일`,
    "day": day,
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
});