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
        position: "-top-6 -left-6 lg:-top-8 lg:-left-10",
        size: "w-16 lg:w-24 h-auto",
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
        position: "-bottom-2 -left-6 lg:-left-10",
        size: "w-14 lg:w-20 h-auto",
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
        position: "-bottom-2 -right-6 lg:-right-10",
        size: "w-14 lg:w-20 h-auto",
      },
    ],
  },
];

function Card({ card }: { card: (typeof leftCards)[0] }) {
  return (
    <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-none mx-auto lg:mx-0">
      <Image
        src={card.cardBg}
        alt=""
        width={600}
        height={300}
        className="w-full h-auto"
        sizes="(max-width: 1024px) 384px, 40vw"
      />

      <div className="absolute inset-0 p-5 lg:p-6 xl:p-8 flex flex-col gap-2 xl:gap-3 items-center justify-center text-center">
        <div className="relative w-full h-10 sm:h-12 xl:h-14">
          <Image
            src={card.titleImg}
            alt={card.title}
            fill
            className="object-contain px-6 xl:px-8"
            sizes="(max-width: 1024px) 384px, 30vw"
          />
        </div>
        <p className="text-white font-semibold text-sm sm:text-base lg:text-lg xl:text-xl leading-snug mx-6 xl:mx-8">
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
  // On desktop the section takes the background art's proportions so the
  // decorations around the edges aren't cropped; it still grows if the
  // content needs more height.
  return (
    <section id="why-choose" className="relative w-full overflow-hidden lg:flex lg:aspect-[1728/1247] lg:items-center">
      {/* Backgrounds — fill whatever height the content div establishes */}
      <Image
        src="/images/LandingPage/why-choose-mobile-bg.svg"
        alt=""
        fill
        className="absolute inset-0 w-full h-full object-cover lg:hidden"
        priority
        sizes="100vw"
      />
      <Image
        src="/images/LandingPage/why-choose-bg.svg"
        alt=""
        fill
        className="absolute inset-0 w-full h-full object-cover hidden lg:block"
        priority
        sizes="100vw"
      />

      {/*
        Content drives the section height without clipping if copy or browser
        chrome changes the available viewport height.
      */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col justify-center items-center gap-4 lg:gap-6 py-14 sm:py-20 px-4 sm:px-10 md:px-16 lg:px-20">
        {/* Section title */}
        <h2 className="relative w-full max-w-md md:max-w-xl h-12 md:h-20 flex-shrink-0">
          <Image
            src="/images/LandingPage/why-choose-tittle.svg"
            alt="Why Choose Izzyspell"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 448px, 576px"
          />
        </h2>

        {/* 2-column staggered layout on desktop, single column below */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-5 lg:gap-8 w-full items-start">
          {/* Left column */}
          <div className="flex flex-col gap-3 sm:gap-5 lg:gap-6 flex-1 w-full lg:w-auto">
            {leftCards.map((card) => (
              <Card key={card.title} card={card} />
            ))}
          </div>

          {/* Right column — slight downward offset for stagger effect */}
          <div className="flex flex-col gap-3 sm:gap-5 lg:gap-6 flex-1 w-full lg:w-auto lg:mt-8">
            {rightCards.map((card) => (
              <Card key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
