// components/KakaoRedirect.tsx
"use client";

import { useEffect } from "react";

export default function KakaoRedirect() {
 useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isKakao = ua.includes("kakaotalk");
    
    if (isKakao) {
      if (ua.includes("android")) {
        // 1. 안드로이드: 외부 브라우저로 즉시 강제 이동
        window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(
          window.location.href
        )}`;
      } else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
        // 2. 아이폰: 강제 이동 스킴이 작동하지 않으므로, 
        // 앱스토어 링크나 특정 스킴을 이용해 사파리를 띄우도록 유도하거나
        // 사용자에게 안내 메시지를 보여주는 것이 최선입니다.
        
        // 아이폰 카톡 인앱뷰 전용 '사파리로 열기' 유도 (가장 많이 쓰이는 방식)
        window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(
          window.location.href
        )}`;
        
        // 만약 위 스킴이 작동하지 않는 환경(최신 iOS 등)을 대비해 
        // "사파리로 열어달라는 안내 페이지"로 이동시키거나 알림을 띄우는 것이 좋습니다.
        setTimeout(() => {
          alert("음성 교육의 품질을 위해 '사파리(Safari)' 브라우저 이용을 권장합니다.\n\n우측 상단의 '...' 버튼을 눌러 '기본 브라우저로 열기'를 선택해주세요.");
        }, 500);
      }
    }
  }, []);

  return null;
}