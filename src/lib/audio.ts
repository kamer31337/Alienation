// /src/lib/audio.ts
let audioContext: AudioContext | null = null;

export const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

const playTone = (freq: number, duration: number, type: OscillatorType = 'sine') => {
  if (!audioContext) initAudio();
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
};

export const playTypeSound = () => playTone(300 + Math.random() * 200, 0.03, 'square');
export const playCompileSound = () => playTone(150, 0.4, 'sawtooth');
export const playTranslateSound = () => playTone(500, 0.2, 'triangle');
