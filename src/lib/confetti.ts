"use client";

import JSConfetti from "js-confetti";

type ConfettiOptions = Parameters<JSConfetti["addConfetti"]>[0];

export const prefersReducedMotion = () =>
  typeof window === "undefined" ||
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// One shared confetti canvas for the whole app (each JSConfetti adds its own full-screen
// canvas). Skipped when the user's device asks for reduced motion.
let confetti: JSConfetti | null = null;
export const fireConfetti = (options?: ConfettiOptions) => {
  if (prefersReducedMotion()) return;
  try {
    confetti ??= new JSConfetti();
    confetti.addConfetti(options);
  } catch (err) {
    console.error("Confetti failed:", err);
  }
};

// Small star burst for one correct word in the practice modes
export const celebrate = () =>
  fireConfetti({ emojis: ["⭐", "🌟", "✨", "🎉"], emojiSize: 40, confettiNumber: 24 });
