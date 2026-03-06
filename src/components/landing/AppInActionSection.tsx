import Image from "next/image";

export default function AppInActionSection() {
  return (
    <section id="app-in-action" className="py-16 px-8 md:px-16 relative overflow-hidden bg-[#ebeef7]">
      <svg className="absolute left-0 top-1/3 w-32 opacity-60 pointer-events-none" viewBox="0 0 120 300" fill="none">
        <path d="M60 10 C20 60, 100 100, 40 150 C-20 200, 80 240, 60 290" stroke="#4793FE" strokeWidth="18" strokeLinecap="round" fill="none" />
      </svg>
      <svg className="absolute right-0 top-1/4 w-32 opacity-60 pointer-events-none" viewBox="0 0 120 300" fill="none">
        <path d="M60 10 C100 60, 20 100, 80 150 C140 200, 40 240, 60 290" stroke="#4793FE" strokeWidth="18" strokeLinecap="round" fill="none" />
      </svg>

      <div className="max-w-7xl mx-auto text-center">
        <h2
          className="text-4xl md:text-5xl font-bold mb-12 inline-block"
          style={{
            color: "#fff6ef",
            WebkitTextStroke: "2px #c15521",
            textShadow: "0px 6px 0px #c15521",
          }}
        >
          See the App in Action
        </h2>

        <div className="relative flex items-end justify-center gap-2 md:gap-6">
          <div className="flex-shrink-0 w-[40%] max-w-xs md:max-w-sm">
            <Image
              src="/images/LandingPage/app-in-action-1.png"
              alt="IzzySpell spelling game"
              width={400}
              height={400}
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>

          <div className="relative flex-shrink-0 w-[20%] max-w-[180px] flex flex-col items-center">
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 w-28 opacity-80 pointer-events-none" viewBox="0 0 120 80" fill="none">
              <path d="M10 70 L35 10 L60 60 L85 15 L110 55" stroke="#4793FE" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Image
              src="/images/LandingPage/hero-character.png"
              alt="IzzySpell character"
              width={180}
              height={180}
              className="w-full h-auto object-contain drop-shadow-xl"
            />
          </div>

          <div className="flex-shrink-0 w-[40%] max-w-xs md:max-w-sm">
            <Image
              src="/images/LandingPage/app-in-action-2.png"
              alt="IzzySpell dashboard"
              width={400}
              height={400}
              className="w-full h-auto object-contain drop-shadow-2xl"
              style={{ transform: "perspective(800px) rotateY(-8deg)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
