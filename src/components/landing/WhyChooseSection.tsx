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
        position: "-top-[3rem] md:-top-[5rem] -left-[3.5rem] md:-left-[7.5rem]",
        size: "w-[8rem] md:w-[15rem] h-auto",
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
        position: "bottom-0 -left-[3.5rem] md:-left-[7.5rem]",
        size: "w-[6rem] md:w-[12rem] h-auto",
      },
      {
        src: "/images/LandingPage/rocket.svg",
        position: "bottom-2 right-2 hidden md:block",
        size: "w-[5rem] md:w-[9rem] h-auto",
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
        position: "bottom-2 -right-[2.5rem] md:-right-[6.5rem]",
        size: "w-[6rem] md:w-[12rem] h-auto",
      },
    ],
  },
];

function Card({ card }: { card: (typeof leftCards)[0] }) {
  return (
    <div className="relative w-full max-w-xs md:max-w-none mx-auto md:mx-0">
      {/* Card background SVG — drives card height */}
      <Image
        src={card.cardBg}
        alt=""
        width={600}
        height={300}
        className="w-full h-auto"
        sizes="(max-width: 768px) 90vw, 40vw"
      />

      {/* Content overlaid on top */}
      <div className="absolute inset-0 p-6 flex flex-col gap-2 items-center justify-center text-center">
        {/* Card title SVG */}
        <div className="relative w-full h-10">
          <Image
            src={card.titleImg}
            alt={card.title}
            fill
            className="object-contain px-10"
            sizes="(max-width: 768px) 80vw, 30vw"
          />
        </div>

        {/* Description */}
        <p className="text-white font-semibold text-base md:text-2xl leading-snug mx-10">
          {card.desc}
        </p>
      </div>

      {/* Extra decorative images */}
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
    <section className="relative overflow-hidden">
      {/* Section background SVG — responsive backgrounds */}
      <Image
        src="/images/LandingPage/why-choose-mobile-bg.svg"
        alt=""
        width={1920}
        height={1080}
        className="relative w-full h-auto md:hidden"
        priority
        sizes="100vw"
      />
      <Image
        src="/images/LandingPage/why-choose-bg.svg"
        alt=""
        width={1920}
        height={980}
        className="object-cover relative w-full h-auto hidden md:block"
        priority
        sizes="100vw"
      />

      <div className="absolute inset-0 z-10 max-w-5xl mx-auto flex flex-col justify-center items-center gap-4 md:gap-10 py-16 px-4 sm:px-8">
        {/* Section title SVG */}
        <div className="relative w-full max-w-md h-[80px]">
          <Image
            src="/images/LandingPage/why-choose-tittle.svg"
            alt="Why Choose Izzyspell"
            width={100}
            height={100}
            className="object-contain w-full h-10 md:h-auto"
          />
        </div>

        {/* Staggered 2-column layout on larger screens, column on small */}
        <div className="flex flex-col md:flex-row gap-1 md:gap-8 w-full items-center">
          {/* Left column — starts at top */}
          <div className="flex flex-col gap-1 md:gap-5 flex-1">
            {leftCards.map((card) => (
              <Card key={card.title} card={card} />
            ))}
          </div>

          {/* Right column — offset down on larger screens to center between left cards */}
          <div className="flex flex-col gap-1 md:gap-5 flex-1 md:mt-10">
            {rightCards.map((card) => (
              <Card key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
