"use client";

import Image from "next/image";

function TextToSpeech({ spell, heightWidth }: { spell: string, heightWidth: number }) {
  const pronounceText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <>
      <Image
        alt="speaker"
        width={heightWidth}
        height={heightWidth}
        src="/images/SpeakerIcon.svg"
        className="cursor-pointer"
        onClick={() => pronounceText(spell)}
        
      />
    </>
  );
}

export default TextToSpeech;
