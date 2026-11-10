"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// Priority list — warmest / most kid-friendly US English voices first
const PREFERRED_VOICES = [
  "Microsoft Ana Online (Natural) - English (United States)",   // young, warm
  "Microsoft Jenny Online (Natural) - English (United States)", // friendly female
  "Microsoft Aria Online (Natural) - English (United States)",  // friendly female
  "Google US English",
  "Samantha", // macOS/iOS — warm, clear
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Davis Online (Natural) - English (United States)",
  "Microsoft Eric Online (Natural) - English (United States)",
  "Microsoft Zira - English (United States)",
  "Microsoft David - English (United States)",
  "Alex", // macOS
];

// Module-level cache so voice is selected once across all instances
let cachedVoice: SpeechSynthesisVoice | null | undefined = undefined;

const getBestVoice = (): SpeechSynthesisVoice | null => {
  if (cachedVoice !== undefined) return cachedVoice;

  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  for (const name of PREFERRED_VOICES) {
    const match = voices.find((v) => v.name === name);
    if (match) {
      cachedVoice = match;
      return match;
    }
  }

  // Fallback: any en-US voice, then any English voice
  cachedVoice =
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;

  return cachedVoice;
};

const isSpeechSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

// onUnavailable (optional): called when speech cannot play (no support, no voices, error)
function TextToSpeech({
  spell,
  heightWidth,
  onUnavailable,
  label = "Hear the word",
  imgClassName = "",
  autoPlay = false,
}: {
  spell: string;
  heightWidth: number;
  onUnavailable?: () => void;
  // Responsive size classes for the icon (heightWidth is the intrinsic/default size)
  imgClassName?: string;
  // Screen reader name for the button (the word itself is never read out, that'd give it away)
  label?: string;
  // Say the word by itself whenever it changes. Browsers block speech until the user has
  // interacted with the page, so the very first word may still need a tap.
  autoPlay?: boolean;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!autoPlay || !isSpeechSupported()) return;
    // Browsers without the User Activation API (older Safari) just try and fail silently
    const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
    if (nav.userActivation && !nav.userActivation.hasBeenActive) return;
    // Short pause so the new word's letters are on screen first
    const timer = setTimeout(() => {
      try {
        // Quiet: auto-play never triggers the "can't speak" fallback (in Quiz that would show
        // the word). Voices often aren't loaded yet here; a tap on the button still reports it.
        startSpeaking(spell, true);
      } catch (error) {
        console.error("Text-to-speech failed:", error);
      }
    }, 400);
    return () => clearTimeout(timer);
    // Only when the word changes (startSpeaking reads the latest props itself)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spell, autoPlay]);

  useEffect(() => {
    if (!isSpeechSupported()) return;

    // Voices may not be ready immediately — pre-load them
    if (speechSynthesis.getVoices().length > 0) {
      getBestVoice();
    } else {
      speechSynthesis.onvoiceschanged = () => {
        getBestVoice();
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const pronounceText = (text: string) => {
    if (!isSpeechSupported()) {
      onUnavailable?.();
      return;
    }

    try {
      speakText(text);
    } catch (error) {
      console.error("Text-to-speech failed:", error);
      setIsSpeaking(false);
      onUnavailable?.();
    }
  };

  const speakText = (text: string) => {
    // Toggle off if already speaking
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    startSpeaking(text);
  };

  const startSpeaking = (text: string, quiet = false) => {
    const reportUnavailable = quiet ? undefined : onUnavailable;
    speechSynthesis.cancel(); // Clear any previous utterance

    // No voices loaded: tell the parent (it can show a fallback) but still try to speak
    if (speechSynthesis.getVoices().length === 0) {
      reportUnavailable?.();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice();

    if (voice) utterance.voice = voice;
    utterance.lang = "en-US";
    utterance.rate = 0.7;   // Slow enough for grade 1 to catch each sound
    utterance.pitch = 1.15; // Slightly higher — friendlier, less monotone
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      // "canceled" / "interrupted" come from our own cancel() calls, not a failure
      if (event.error !== "canceled" && event.error !== "interrupted") {
        reportUnavailable?.();
      }
    };

    speechSynthesis.speak(utterance);
  };

  // A real button so it can be reached and pressed with the keyboard
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSpeaking}
      onClick={() => pronounceText(spell)}
      className="inline-flex flex-shrink-0 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue focus-visible:ring-offset-2"
    >
      <Image
        alt=""
        width={heightWidth}
        height={heightWidth}
        src="/images/SpeakerIcon.svg"
        className={`cursor-pointer transition-opacity ${imgClassName} ${isSpeaking ? "opacity-50" : "opacity-100"}`}
      />
    </button>
  );
}

export default TextToSpeech;
