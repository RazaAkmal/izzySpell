import Image from "next/image";

const cards = [
  {
    img: "/images/LandingPage/credibility-proven-results.png",
    bg: "bg-[#4793FE]",
    label: "Proven Results",
    desc: "Join 50,000+ families already improving spelling scores with IzzySpell.",
  },
  {
    img: "/images/LandingPage/credibility-track-progress.png",
    bg: "bg-[#57AE0C]",
    label: "Track Progress & Achievements",
    desc: "Weekly reports and badges keep parents informed and kids motivated.",
  },
  {
    img: "/images/LandingPage/credibility-full-education.png",
    bg: "bg-[#956CFC]",
    label: "Building Experts in Full Education",
    desc: "Curriculum-aligned content trusted by teachers in classrooms nationwide.",
  },
];

export default function CredibilitySection() {
  return (
    <section className="bg-[#FFC820] py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] text-center mb-14">
          Build Credibility with Parents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((c) => (
            <div key={c.label} className={`${c.bg} rounded-2xl p-8 text-white flex flex-col items-center text-center shadow-lg hover-scale`}>
              <Image src={c.img} alt={c.label} width={96} height={96} className="object-contain mb-5" />
              <h3 className="font-bold text-lg mb-2">{c.label}</h3>
              <p className="text-white/90 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
