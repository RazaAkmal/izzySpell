import Image from "next/image";

const features = [
  {
    img: "/images/LandingPage/feature-voice-pronunciation.png",
    title: "Voice & Pronunciation Guide",
    desc: "Learn correct pronunciation for every word with our built-in audio guide.",
  },
  {
    img: "/images/LandingPage/feature-track-progress.png",
    title: "Track Progress",
    desc: "Earn stars, badges & rewards. See improvement across every session.",
  },
  {
    img: "/images/LandingPage/feature-smart-learning.png",
    title: "Smart Learning App",
    desc: "Adaptive lessons that adjust to your child's ability to maximise growth.",
  },
  {
    img: "/images/LandingPage/feature-interactive-lessons.png",
    title: "Interactive Lessons",
    desc: "Fun, game-like lessons that keep kids engaged and eager to improve.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] text-center mb-14">
          Why Choose IzzySpell
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-lightBlue rounded-2xl p-6 flex flex-col items-center text-center hover-scale border border-blueStroke/30">
              <div className="flex items-center justify-center h-24 mb-4">
                <Image src={f.img} alt={f.title} width={80} height={80} className="object-contain max-h-full" />
              </div>
              <h3 className="font-bold text-[#1a3a6b] text-base mb-2">{f.title}</h3>
              <p className="text-darkGray text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
