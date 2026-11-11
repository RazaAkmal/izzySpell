"use client";

// Small sound effects for the practice modes, synthesised with the Web Audio API (no audio
// files to load). The kid's choice to mute them is remembered in localStorage.

export type SoundName = "pop" | "correct" | "wrong";

const MUTE_KEY = "izzyspell-sfx-muted";
const listeners = new Set<() => void>();

let muted: boolean | null = null;
let audioContext: AudioContext | null = null;

export const isMuted = () => {
  if (muted === null) {
    try {
      muted = window.localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      muted = false;
    }
  }
  return muted;
};

export const setMuted = (value: boolean) => {
  muted = value;
  try {
    window.localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // Private mode etc.: the choice just lasts for this page
  }
  listeners.forEach((listener) => listener());
};

// For useSyncExternalStore
export const subscribeMuted = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Each note: frequency (Hz), start offset and length (seconds)
const SOUNDS: Record<SoundName, { type: OscillatorType; notes: [number, number, number][]; volume: number }> = {
  // Short soft blip when a letter lands
  pop: { type: "sine", notes: [[660, 0, 0.08]], volume: 0.15 },
  // Rising three-note chime
  correct: { type: "triangle", notes: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.25]], volume: 0.2 },
  // Gentle two-note "uh-oh", not harsh
  wrong: { type: "sine", notes: [[392, 0, 0.15], [330, 0.15, 0.22]], volume: 0.15 },
};

export const playSound = (name: SoundName) => {
  if (typeof window === "undefined" || isMuted()) return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    audioContext ??= new AudioCtx();
    const ctx = audioContext;
    if (ctx.state === "suspended") void ctx.resume();

    const { type, notes, volume } = SOUNDS[name];
    const now = ctx.currentTime;
    for (const [frequency, start, length] of notes) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      // Quick fade in/out so notes don't click
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(volume, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + length);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + length + 0.02);
    }
  } catch (err) {
    console.error("Sound effect failed:", err);
  }
};
