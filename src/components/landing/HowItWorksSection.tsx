import Link from "next/link";
import Image from "next/image";

const steps = [
  {
    img: "/images/LandingPage/how-it-works-word-list.png",
    title: "Choose a Word List",
    desc: "Pick from our library or create your own custom spelling list tailored to your child's grade.",
  },
  {
    img: "/images/LandingPage/how-it-works-interactive.png",
    title: "Get Interactive Learning",
    desc: "Kids practice with voice, flashcards, quiz mode and word builder games that make spelling stick.",
  },
  {
    img: "/images/LandingPage/how-it-works-track-learning.png",
    title: "Track Your Learning",
    desc: "See daily progress, spot weak areas, and build confidence as your child masters each word.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] text-center mb-14">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="relative h-36 w-36 flex items-center justify-center mb-6">
                <Image src={step.img} alt={step.title} width={128} height={128} className="object-contain max-h-full" />
                <span className="absolute -top-2 -left-2 bg-blue text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-[#1a3a6b] text-lg mb-3">{step.title}</h3>
              <p className="text-darkGray text-sm leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/sign-in" className="inline-block bg-blue text-white px-8 py-4 rounded-full font-bold text-base shadow-lg hover:bg-darkBlue hover-scale transition-all">
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
