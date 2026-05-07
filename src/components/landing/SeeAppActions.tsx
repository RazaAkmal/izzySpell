import React from "react";
import Image from "next/image";

const SeeAppActions = () => {
  return (
    <section id="see-app-actions" className="relative w-full overflow-hidden bg-[#EBF9FF]">
      {/*
        The SVGs contain all visual content (title, tablets, characters).
        Document-flow lets the SVG determine the section height naturally
        so nothing gets cropped. object-cover on an SVG with embedded
        content would crop and hide important elements.
      */}
      <Image
        src="/images/LandingPage/see-app-action-mobile-bg.svg"
        alt=""
        width={1920}
        height={1200}
        className="w-full h-auto md:hidden"
        aria-hidden="true"
        priority
        sizes="100vw"
      />
      <Image
        src="/images/LandingPage/see-app-actions.svg"
        alt=""
        width={1920}
        height={900}
        className="w-full h-auto hidden md:block"
        aria-hidden="true"
        priority
        sizes="100vw"
      />
    </section>
  );
};

export default SeeAppActions;
