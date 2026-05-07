import Image from "next/image";

const leftCards = [
  {
    title: "Voice & Pronunciation",
    titleImg: "/images/LandingPage/why-choose-title-1.svg",
    desc: "Learn correct pronunciation using AI.",
    cardBg: "/images/LandingPage/why-choose-card-bg-1.svg",
    extraImages: [
      {
        src: "/images/LandingPage/abc.svg",
        position: "-top-[2rem] md:-top-[3rem] -left-[2.5rem] md:-left-[4.5rem]",
        size: "w-[6rem] md:w-[9rem] h-auto",
      },
    ],
  },
  {
    title: "Smart Learning App",
    titleImg: "/images/LandingPage/why-choose-title-2.svg",
    desc: "Quizzes that grow smarter as your child does!",
    cardBg: "/images/LandingPage/why-choose-card-bg-2.svg",
    extraImages: [
      {
        src: "/images/LandingPage/anima-2.svg",
        position: "bottom-0 -left-[2.5rem] md:-left-[4.5rem]",
        size: "w-[5rem] md:w-[8rem] h-auto",
      },
      {
        src: "/images/LandingPage/rocket.svg",
        position: "bottom-2 right-2 hidden md:block",
        size: "w-[4rem] md:w-[6rem] h-auto",
      },
    ],
  },
];

const rightCards = [
  {
    title: "Track Progress",
    titleImg: "/images/LandingPage/why-choose-title-3.svg",
    desc: "Earn stars, badges & unlock New levels.",
    cardBg: "/images/LandingPage/why-choose-card-bg-3.svg",
    extraImages: [],
  },
  {
    title: "Interactive Lessons",
    titleImg: "/images/LandingPage/why-choose-title-4.svg",
    desc: "Play & Learn new words through mini games.",
    cardBg: "/images/LandingPage/why-choose-card-bg-4.svg",
    extraImages: [
      {
        src: "/images/LandingPage/anima-1.svg",
        position: "bottom-2 -right-[2rem] md:-right-[4rem]",
        size: "w-[5rem] md:w-[8rem] h-auto",
      },
    ],
  },
];

function Card({ card }: { card: (typeof leftCards)[0] }) {
  return (
    <div className="relative w-full max-w-xs md:max-w-none mx-auto md:mx-0">
      <Image
        src={card.cardBg}
        alt=""
        width={600}
        height={300}
        className="w-full h-auto"
        sizes="(max-width: 768px) 90vw, 40vw"
      />

      <div className="absolute inset-0 p-5 md:p-8 flex flex-col gap-2 md:gap-3 items-center justify-center text-center">
        <div className="relative w-full h-10 md:h-14">
          <Image
            src={card.titleImg}
            alt={card.title}
            fill
            className="object-contain px-6 md:px-8"
            sizes="(max-width: 768px) 80vw, 30vw"
          />
        </div>
        <p className="text-white font-semibold text-sm md:text-xl leading-snug mx-6 md:mx-8">
          {card.desc}
        </p>
      </div>

      {card.extraImages?.map((img, index) => (
        <Image
          key={index}
          src={img.src}
          alt=""
          width={40}
          height={40}
          className={`absolute ${img.position} ${img.size}`}
        />
      ))}
    </div>
  );
}

export default function WhyChooseSection() {
  return (
    <section id="why-choose" className="relative w-full overflow-hidden">
      {/* Backgrounds — fill whatever height the content div establishes */}
      <Image
        src="/images/LandingPage/why-choose-mobile-bg.svg"
        alt=""
        fill
        className="absolute inset-0 w-full h-full object-cover md:hidden"
        priority
        sizes="100vw"
      />
      <Image
        src="/images/LandingPage/why-choose-bg.svg"
        alt=""
        fill
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
        priority
        sizes="100vw"
      />

      {/*
        Content drives the section height without clipping if copy or browser
        chrome changes the available viewport height.
      */}
      <div className="relative z-10 min-h-[780px] md:min-h-screen max-w-6xl mx-auto flex flex-col justify-center items-center gap-4 md:gap-6 py-12 px-4 sm:px-10 md:px-16 lg:px-20">
        {/* Section title */}
        <div className="relative w-full max-w-md md:max-w-xl h-12 md:h-20 flex-shrink-0">
          <Image
            src="/images/LandingPage/why-choose-tittle.svg"
            alt="Why Choose Izzyspell"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 448px, 576px"
          />
        </div>

        {/* 2-column staggered layout (single column on mobile) */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-8 w-full items-start">
          {/* Left column */}
          <div className="flex flex-col gap-3 md:gap-6 flex-1 w-full md:w-auto">
            {leftCards.map((card) => (
              <Card key={card.title} card={card} />
            ))}
          </div>

          {/* Right column — slight downward offset for stagger effect */}
          <div className="flex flex-col gap-3 md:gap-6 flex-1 w-full md:w-auto md:mt-8">
            {rightCards.map((card) => (
              <Card key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
