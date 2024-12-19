"use client";

import Image from "next/image";

function TextToSpeech({ spell }: { spell: string }) {
  const pronounceText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <>
      <Image
        alt="speaker"
        width={10}
        height={10}
        src="/images/SpeakerIcon.svg"
        className="w-12 cursor-pointer"
        onClick={() => pronounceText(spell)}
      />
    </>
  );
}

export default TextToSpeech;
