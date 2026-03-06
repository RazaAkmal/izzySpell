import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
      style={{ background: "linear-gradient(135deg, #CBE8FF 0%, #76C8FF 50%, #CBE8FF 100%)" }}
    >
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[60%] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #a8d8ff 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[55%] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #76C8FF 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16">
        <div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a3a6b] leading-tight mb-6">
            Spell<br />Play<br />Learn
          </h1>
          <p className="text-[#2a5a9b] text-lg mb-8 max-w-md leading-relaxed">
            Voice &amp; pronunciation powered spelling practice that makes learning fun for kids. Track progress, earn badges, and master new words every day.
          </p>
          <Link
            href="/sign-in"
            className="inline-block bg-blue text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-darkBlue hover-scale transition-all"
          >
            Start Free Today
          </Link>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="relative">
            <Image
              src="/images/LandingPage/hero-tablet-mockup.png"
              alt="IzzySpell App"
              width={600}
              height={500}
              className="w-full max-w-lg h-auto object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <Image
            src="/images/LandingPage/hero-character.png"
            alt="IzzySpell Character"
            width={224}
            height={224}
            className="absolute -top-8 -right-4 md:-right-12 w-40 md:w-56 h-auto object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 30C1200 80 960 10 720 40C480 70 240 0 0 30L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
