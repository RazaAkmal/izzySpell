import Image from "next/image";
import Link from "next/link";

const cardGlow = `
  inset 0 0 0 9px rgba(126, 205, 255, 0.6),
  inset 0 4px 24px rgba(126, 205, 255, 0.3),
  inset 0 -4px 24px rgba(126, 205, 255, 0.15),
  0 0 20px rgba(126, 205, 255, 0.6),
  0 0 50px rgba(126, 205, 255, 0.35),
  0 0 90px rgba(14, 165, 233, 0.25)
`;

const cardClass =
  "group relative w-full overflow-hidden rounded-[44px] bg-white transition-transform sm:rounded-[56px] lg:rounded-[75px] lg:hover:scale-[1.03]";
const bodyTextClass = "text-lg font-bold leading-tight text-[#3AB0FA] sm:text-xl xl:text-2xl";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className={`space-y-2 pl-1 ${bodyTextClass}`}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3AB0FA]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative w-full overflow-hidden bg-[#E8F5FF]"
    >
      <Image
        src="/images/LandingPage/how-it-works-bg.svg"
        alt=""
        fill
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
        sizes="100vw"
      />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-8 py-16 sm:py-20 md:py-24">
        <h2>
          <Image
            src="/images/LandingPage/how-it-works-title.png"
            alt="How It Works"
            width={437}
            height={73}
            className="mx-auto mb-10 w-[260px] sm:mb-14 sm:w-[320px] md:w-[400px]"
            quality={100}
            sizes="(max-width: 640px) 260px, (max-width: 768px) 320px, 400px"
          />
        </h2>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className={`${cardClass} lg:w-[43%] lg:max-w-[516px]`} style={{ boxShadow: cardGlow }}>
            <div className="relative z-10 flex h-full flex-col p-7 sm:p-8 lg:p-10">
              <Image
                src="/images/LandingPage/Choose-Level.png"
                alt="Choose a Level"
                width={284}
                height={43}
                className="mb-3 h-auto w-[200px] sm:w-[220px] lg:w-[240px]"
                quality={100}
                sizes="(max-width: 640px) 200px, (max-width: 1024px) 220px, 240px"
              />
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`mb-3 ${bodyTextClass}`}>Select your difficulty</p>
                  <BulletList items={["Beginner", "Intermediate", "Advanced"]} />
                </div>
                <div className="relative min-h-[100px] w-[32%] max-w-[150px] flex-shrink-0 self-stretch sm:min-h-[120px]">
                  <Image
                    src="/images/LandingPage/choose-card-img1.png"
                    alt=""
                    fill
                    className="object-contain"
                    quality={100}
                    sizes="150px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} lg:w-[57%] lg:max-w-[684px]`} style={{ boxShadow: cardGlow }}>
            <div className="relative z-10 flex h-full flex-col p-7 sm:p-8 lg:p-10">
              <Image
                src="/images/LandingPage/Start-Learning.png"
                alt="Start Learning with Fun Words"
                width={380}
                height={96}
                className="mb-3 h-auto w-[240px] sm:w-[280px] lg:w-[320px]"
                quality={100}
                sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 320px"
              />
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`max-w-60 ${bodyTextClass}`}>
                    Through different games learn new words
                  </p>
                </div>
                <div className="relative min-h-[100px] w-[32%] max-w-[170px] flex-shrink-0 self-stretch sm:min-h-[120px]">
                  <Image
                    src="/images/LandingPage/choose-card-img2.png"
                    alt=""
                    fill
                    className="object-contain"
                    quality={100}
                    sizes="170px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-end gap-6 lg:flex-row">
          <div className={`${cardClass} lg:w-[68%] lg:max-w-[820px]`} style={{ boxShadow: cardGlow }}>
            <div className="relative z-10 flex h-full flex-col p-7 sm:p-8 lg:p-10">
              <Image
                src="/images/LandingPage/Choose-Mode.png"
                alt="Choose Mode of Learning"
                width={485}
                height={52}
                className="mb-3 h-auto w-[250px] sm:w-[360px] lg:w-[400px]"
                quality={100}
                sizes="(max-width: 640px) 250px, (max-width: 1024px) 360px, 400px"
              />
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`mb-3 ${bodyTextClass}`}>Three different learning modes</p>
                  <BulletList items={["Default", "Syllabus Mode", "Word Groups Mode"]} />
                </div>
                <div className="relative min-h-[100px] w-[30%] max-w-[150px] flex-shrink-0 self-stretch sm:min-h-[120px]">
                  <Image
                    src="/images/LandingPage/choose-card-img3.png"
                    alt=""
                    fill
                    className="object-contain"
                    quality={100}
                    sizes="170px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Decorative mascot — only where there is room beside the card */}
          <div className="relative hidden h-[200px] flex-1 self-center lg:block">
            <Image
              src="/images/LandingPage/choose-card-4.png"
              alt=""
              fill
              className="object-contain"
              aria-hidden="true"
              quality={100}
              sizes="220px"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="relative mt-10 flex items-center justify-center md:mt-12">
          <Link
            href="/sign-in"
            className="rounded-full transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white active:scale-95"
          >
            <Image
              src="/images/LandingPage/start-training-button.svg"
              alt="Start Training"
              width={288}
              height={72}
              className="w-60 md:w-72 h-auto"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
