// lib/audioService.ts

/**
 * 무료 Web Speech API를 사용한 음성 재생 서비스
 */

interface AudioServiceOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private defaultOptions: AudioServiceOptions = {
    lang: 'ko-KR', // Google TTS는 'en-US' 대신 'en'을 기본으로 사용 가능
  };

async play(text: string, options?: { rate?: number }) {
  const synthesis: SpeechSynthesis = window.speechSynthesis;

  const loadVoices = (timeoutMs = 1200) =>
    new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const start = Date.now();

      const tryResolve = () => {
        const voices = synthesis.getVoices();
        if (voices && voices.length) return resolve(voices);
        if (Date.now() - start > timeoutMs) return resolve([]); // 타임아웃 fallback
        setTimeout(tryResolve, 80);
      };

      // iOS/Chrome 모두에서 onvoiceschanged가 안 뜨는 케이스가 있어 폴링 병행
      synthesis.addEventListener(
          "voiceschanged",
          () => resolve(synthesis.getVoices()),
          { once: true }
        );

      tryResolve();
    });

  const voices = await loadVoices();
  const koVoices = voices.filter(v => (v.lang || "").toLowerCase().startsWith("ko"));

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = options?.rate ?? 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // 플랫폼 힌트
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);

  const scoreVoice = (v: SpeechSynthesisVoice) => {
    let s = 0;
    const name = (v.name || "").toLowerCase();
    const uri = (v.voiceURI || "").toLowerCase();
    const lang = (v.lang || "").toLowerCase();

    // 언어 정확도
    if (lang === "ko-kr") s += 50;
    else if (lang.startsWith("ko")) s += 30;

    // Google 계열(안드로이드에서 정석 발음인 경우 많음)
    if (name.includes("google")) s += 25;

    // iOS Apple 계열 voiceURI 힌트 (Siri가 항상 최고 음질이 아님)
    if (uri.includes("com.apple")) s += 20;

    // "compact" 류 먹먹/전화기 음질 회피
    if (name.includes("compact") || uri.includes("compact")) s -= 30;
    if (name.includes("telephony") || uri.includes("telephony")) s -= 30;

    // 로컬 서비스 보이스 선호 (환경에 따라 더 자연스러운 경우)
    if (v.localService) s += 5;

    // 이상한 엔진(대표적으로 espeak 계열)로 추정되면 감점
    if (name.includes("espeak") || uri.includes("espeak")) s -= 40;

    return s;
  };

  let selected: SpeechSynthesisVoice | undefined;

  if (koVoices.length) {
    selected = [...koVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
  } else {
    // 한국어 보이스가 아예 없으면 일단 lang만 지정 (하지만 억양 문제 가능)
    selected = undefined;
  }

  if (selected) utterance.voice = selected;

  return new Promise<void>((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    // iOS에서 cancel 직후 speak 하면 먹먹/씹힘이 생기는 케이스가 있어 딜레이 증가
    synthesis.cancel();
    const delay = isIOS ? 220 : 80;
    setTimeout(() => synthesis.speak(utterance), delay);
  });
}




  /**
   * 재생 중지
   */
stop(): void {
 if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    // 기존 Web Speech API도 혹시 모르니 중지
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }



  /**
   * 브라우저 지원 여부 확인 (HTML5 Audio 지원 확인)
   */
  isSupported(): boolean {
    return typeof Audio !== 'undefined';
  }

  /**
   * 사용 가능한 음성 목록 가져오기
   */
  async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    return [];
  }

  /**
   * 현재 기기가 모바일인지 확인
   */
 private checkIsMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

}

// 싱글톤 인스턴스
export const audioService = new AudioService();