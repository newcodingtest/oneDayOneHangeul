export const detectAudioEnv = () => {
  if(typeof window === 'undefined'){
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      canUseWebTTS: false,
    };
  }

  const ua = navigator.userAgent;

  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid;

  const canUseWebTTS = typeof window.speechSynthesis !== 'undefined' &&
                      typeof window.SpeechSynthesisUtterance !== 'undefined';

  return {
    isMobile,
    isIOS,
    isAndroid,
    canUseWebTTS
  }
}