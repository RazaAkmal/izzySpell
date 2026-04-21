import React from "react";
import Image from "next/image";

const SeeAppActions = () => {
  return (
    <section
      id="see-app-actions"
      className="relative overflow-hidden bg-[#EBF9FF]"
    >
      <Image
        src="/images/LandingPage/see-app-action-mobile-bg.svg"
        alt=""
        fill
        className="object-fill !relative md:hidden"
        aria-hidden="true"
        priority
      />
      <Image
        src="/images/LandingPage/see-app-actions.svg"
        alt=""
        fill
        className="object-fill !relative hidden md:block"
        aria-hidden="true"
        priority
      />
    </section>
  );
};

export default SeeAppActions;
