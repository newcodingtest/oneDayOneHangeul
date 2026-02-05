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

// 1. 클래스 메서드로 정의 (추천)
  public playNativeTTS(text: string): void {
    // 이전 오디오가 재생 중이라면 중지
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    // 구글 번역기 TTS 엔진 주소 (무료)
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ko&client=tw-ob`;
    
    const audio = new Audio(googleTtsUrl);
    this.currentAudio = audio; // 현재 재생 중인 오디오 저장

    audio.play().catch(e => {
      console.error("재생 실패: 반드시 사용자 클릭 이벤트 내부에서 호출되어야 합니다.", e);
    });

    // 재생이 끝나면 참조 제거
    audio.onended = () => {
      this.currentAudio = null;
    };
  }

async speakFree(text: string, options?: AudioServiceOptions) {
  const synth = window.speechSynthesis;
  synth.cancel();

  // 1. 한국어 보이스만 필터링해서 목록 확보
  let voices = synth.getVoices().filter(v => v.lang.includes('ko'));

  // 2. 만약 목록이 비었다면 (모바일 대응) 0.1초 뒤 다시 시도
  if (voices.length === 0) {
    await new Promise(r => setTimeout(r, 100));
    voices = synth.getVoices().filter(v => v.lang.includes('ko'));
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // 3. [핵심] 굴리는 발음(en)이 절대 안 나오게 한국어 보이스 강제 할당
  // 구글(안드로이드)이나 시리(아이폰) 보이스를 우선적으로 찾음
  const bestVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Siri')) || voices[0];

  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = 'ko-KR';
    
    // 4. 모바일에서 소리가 안 나는 걸 방지하기 위한 꼼수 (살짝 느리게)
    utterance.rate = 0.9; 
    synth.speak(utterance);
  } else {
    // 한국어 보이스가 아예 없을 때만 브라우저 기본값 시도
    utterance.lang = 'ko-KR';
    synth.speak(utterance);
  }
}
async play(text: string, options?: AudioServiceOptions): Promise<void> {
  const synthesis = window.speechSynthesis;
  if (!synthesis) return;

  synthesis.cancel();
  synthesis.resume(); 

  const getKoreanVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      let voices = synthesis.getVoices();
      // [핵심] lang에 'ko'가 포함된 보이스만 필터링해서 추출
      const filtered = voices.filter(v => v.lang.toLowerCase().includes('ko'));
      
      if (filtered.length > 0) {
        resolve(filtered);
      } else {
        synthesis.onvoiceschanged = () => {
          const retryFiltered = synthesis.getVoices().filter(v => v.lang.toLowerCase().includes('ko'));
          resolve(retryFiltered);
        };
        // 0.5초 대기 후에도 없으면 빈 배열 반환 (무한 대기 방지)
        setTimeout(() => resolve(synthesis.getVoices().filter(v => v.lang.toLowerCase().includes('ko'))), 500);
      }
    });
  };

  const koVoices = await getKoreanVoices();
  
  // 만약 한국어 보이스를 아예 못 찾았다면 재생 중단 (영어 발음 방지)
  if (koVoices.length === 0) {
    console.warn("한국어 음성 엔진을 찾을 수 없습니다. 기기 설정을 확인해주세요.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // [안드로이드 전용 최적화 매칭]
  // 안드로이드는 구글 엔진(Google)과 삼성 엔진(Samsung) 순서로 찾되, 
  // 반드시 한국어(ko)인 것만 골라냅니다.
  const selectedVoice = 
    koVoices.find(v => v.name.toLowerCase().includes('google')) || 
    koVoices.find(v => v.name.toLowerCase().includes('samsung')) ||
    koVoices[0];

  utterance.voice = selectedVoice;
  utterance.lang = 'ko-KR'; // 명시적으로 한 번 더 지정
  
  // 안드로이드에서 영어처럼 들리는 현상을 방지하기 위해 
  // 피치와 속도를 한국어 정석 발음에 맞춥니다.
  utterance.rate = options?.rate || 0.9; 
  utterance.pitch = 1.0;

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => {
      synthesis.cancel();
      resolve();
    };

    setTimeout(() => {
      synthesis.speak(utterance);
    }, 100);
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