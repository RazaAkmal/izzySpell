"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// Priority list — best quality US English voices first (Chrome, Edge, Safari/macOS)
const PREFERRED_VOICES = [
  "Google US English",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Davis Online (Natural) - English (United States)",
  "Microsoft Eric Online (Natural) - English (United States)",
  "Microsoft Ana Online (Natural) - English (United States)",
  "Microsoft David - English (United States)",
  "Microsoft Zira - English (United States)",
  "Samantha", // macOS/iOS
  "Alex",     // macOS
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

function TextToSpeech({ spell, heightWidth }: { spell: string; heightWidth: number }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
    // Toggle off if already speaking
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    speechSynthesis.cancel(); // Clear any previous utterance

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice();

    if (voice) utterance.voice = voice;
    utterance.lang = "en-US";
    utterance.rate = 0.9;  // Slightly slower — easier for kids to follow
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  return (
    <Image
      alt="speaker"
      width={heightWidth}
      height={heightWidth}
      src="/images/SpeakerIcon.svg"
      className={`cursor-pointer transition-opacity ${isSpeaking ? "opacity-50" : "opacity-100"}`}
      onClick={() => pronounceText(spell)}
    />
  );
}

export default TextToSpeech;
