import Link from "next/link";
import Image from "next/image";

const steps = [
  { img: "/images/LandingPage/ready-install-app.png", label: "Install App" },
  { img: "/images/LandingPage/ready-setup-profile.png", label: "Set Up Profile" },
  { img: "/images/LandingPage/ready-assign-lessons.png", label: "Assign Lessons" },
  { img: "/images/LandingPage/ready-program-learning.png", label: "Program Learning" },
];

export default function ReadyToStartSection() {
  return (
    <section id="get-started" className="py-20 px-8 md:px-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #058D6E 0%, #00DCA9 100%)" }}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start?</h2>
        <p className="text-white/80 text-base mb-14 max-w-xl mx-auto">
          It&apos;s free to start learning. Join thousands of families already using IzzySpell to build confident spellers.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {steps.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center gap-3">
              <div className="bg-white/20 rounded-2xl p-5 w-24 h-24 flex items-center justify-center">
                <Image src={step.img} alt={step.label} width={56} height={56} className="object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/30 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{i + 1}</span>
                <span className="text-white text-sm font-medium">{step.label}</span>
              </div>
            </div>
          ))}
        </div>
        <Link href="/sign-in" className="inline-block bg-white text-darkGreen px-8 py-4 rounded-full font-bold text-base shadow-lg hover:shadow-xl hover-scale transition-all">
          Start Free Now
        </Link>
      </div>
    </section>
  );
}
