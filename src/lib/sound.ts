// Tiny synthesized chime kit — no audio files, just gentle Web Audio tones.
// Triggered from click handlers, so it satisfies browser autoplay policies.

let muted = false;
export function setMuted(m: boolean) {
  muted = m;
}

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (muted) return null;
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** One soft bell note with a gentle pluck envelope. */
function note(freq: number, startOffset: number, dur: number, peak: number, type: OscillatorType = 'sine') {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + startOffset;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// Pentatonic-ish notes feel cheerful and never dissonant.
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const A5 = 880.0;
const C6 = 1046.5;

/** A subtask bloomed — a quick two-note sparkle. */
export function playBloom() {
  note(G5, 0, 0.5, 0.18);
  note(C6, 0.08, 0.6, 0.14);
}

/** A whole project completed — a happy little rising arpeggio. */
export function playProjectComplete() {
  [C5, E5, G5, C6, A5].forEach((f, i) => note(f, i * 0.1, 0.7, 0.16, i === 4 ? 'triangle' : 'sine'));
}

/** Watering a parched plant — a soft, low droplet plink. */
export function playWater() {
  note(A5, 0, 0.28, 0.1, 'triangle');
  note(E5, 0.06, 0.34, 0.08);
}

/** Seeds planted — a gentle low pop. */
export function playPlant() {
  note(C5, 0, 0.22, 0.12, 'triangle');
}
