// components/KakaoRedirect.tsx
"use client";

import { useEffect } from "react";

export default function KakaoRedirect() {
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("kakaotalk") && ua.includes("android")) {
      // 안드로이드 카톡 인앱뷰일 때 외부 브라우저로 강제 이동
      window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, []);

  return null; // 화면에 아무것도 그리지 않음
}