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
        className=" h-16 w-16 md:h-20 md:w-20 cursor-pointer"
        onClick={() => pronounceText(spell)}
        
      />
    </>
  );
}

export default TextToSpeech;
