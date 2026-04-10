import Image from "next/image";
import Link from "next/link";

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#4ABFFC] px-4 py-16 sm:px-8 sm:py-20 md:py-24"
    >
      <Image
        src="/images/landingpage/how-it-works-bg.svg"
        alt=""
        fill
        className="object-cover"
        aria-hidden="true"
        priority
      />
      <div className="relative mx-auto max-w-[1200px]">
        <Image
          src="/images/landingpage/how-it-works-title.png"
          alt="How It Works"
          width={400}
          height={100}
          className="mx-auto mb-14 w-[320px] md:w-[400px]"
        />

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <div
            className="group relative w-full overflow-hidden max-w-[516px] rounded-[75px] bg-white transition-transform hover:scale-[1.03] sm:w-[43%]"
            style={{
              boxShadow: `
                inset 0 0 0 9px rgba(126, 205, 255, 0.6),
                inset 0 4px 24px rgba(126, 205, 255, 0.3),
                inset 0 -4px 24px rgba(126, 205, 255, 0.15),
                0 0 20px rgba(126, 205, 255, 0.6),
                0 0 50px rgba(126, 205, 255, 0.35),
                0 0 90px rgba(14, 165, 233, 0.25)
              `,
            }}
          >
            <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
              <Image
                src="/images/landingpage/Choose-Level.png"
                alt="Choose a Level"
                width={300}
                height={60}
                className="mb-3 h-auto w-[220px] lg:w-[240px]"
              />
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="mb-3 text-2xl font-bold leading-tight text-[#3AB0FA]">
                    Select your difficulty
                  </p>
                  <ul className="space-y-2 pl-1 text-2xl font-bold leading-tight text-[#3AB0FA]">
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3AB0FA]" />
                      Beginner
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3AB0FA]" />
                      Intermediate
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3AB0FA]" />
                      Advanced
                    </li>
                  </ul>
                </div>
                <div className="relative min-h-[150px] w-[40%] flex-shrink-0 sm:h-full">
                  <Image
                    src="/images/landingpage/choose-card-img1.png"
                    alt="Choose a Level"
                    fill
                    className="object-contain mt-6"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="group relative w-full overflow-hidden max-w-[684px] rounded-[75px] bg-white transition-transform hover:scale-[1.03] sm:w-[57%]"
            style={{
              boxShadow: `
                inset 0 0 0 9px rgba(126, 205, 255, 0.6),
                inset 0 4px 24px rgba(126, 205, 255, 0.3),
                inset 0 -4px 24px rgba(126, 205, 255, 0.15),
                0 0 20px rgba(126, 205, 255, 0.6),
                0 0 50px rgba(126, 205, 255, 0.35),
                0 0 90px rgba(14, 165, 233, 0.25)
              `,
            }}
          >
            <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
              <Image
                src="/images/landingpage/Start-Learning.png"
                alt="Start Learning with Fun Words"
                width={300}
                height={60}
                className="mb-3 h-auto w-[280px] lg:w-[320px]"
              />
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold leading-tight text-[#3AB0FA] max-w-60">
                    Through different games learn new words
                  </p>
                </div>
                <div className="relative min-h-[150px] w-[40%] flex-shrink-0 sm:h-full">
                  <Image
                    src="/images/landingpage/choose-card-img2.png"
                    alt="Fun Words"
                    fill
                    className="object-contain mt-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-end gap-4 sm:flex-row sm:gap-6">
          <div
            className="group relative w-full overflow-hidden max-w-[820px] rounded-[75px] bg-white transition-transform hover:scale-[1.03] sm:w-[68%]"
            style={{
              boxShadow: `
                inset 0 0 0 9px rgba(126, 205, 255, 0.6),
                inset 0 4px 24px rgba(126, 205, 255, 0.3),
                inset 0 -4px 24px rgba(126, 205, 255, 0.15),
                0 0 20px rgba(126, 205, 255, 0.6),
                0 0 50px rgba(126, 205, 255, 0.35),
                0 0 90px rgba(14, 165, 233, 0.25)
              `,
            }}
          >
            <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
              <Image
                src="/images/landingpage/Choose-Mode.png"
                alt="Choose Mode of Learning"
                width={300}
                height={60}
                className="mb-3 h-auto w-[360px] lg:w-[400px]"
              />
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="mb-3 text-2xl font-bold leading-tight text-[#3AB0FA]">
                    Three different learning Mode
                  </p>
                  <ul className="space-y-2 pl-1 text-2xl font-bold leading-tight text-[#3AB0FA]">
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3AB0FA]" />
                      Default
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3AB0FA]" />
                      Syllabus Mode
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3AB0FA]" />
                      Word Groups Mode
                    </li>
                  </ul>
                </div>
                <div className="relative min-h-[150px] w-[35%] flex-shrink-0 sm:h-full">
                  <Image
                    src="/images/landingpage/choose-card-img3.png"
                    alt="Mode of Learning"
                    fill
                    className="object-contain mt-6"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative block aspect-square flex-1">
            <Image
              src="/images/landingpage/choose-card-4.png"
              alt=""
              fill
              className="object-cover mt-16 mr-10"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="relative mt-5 md:mt-12 flex items-center justify-center">
          <Link
            href="/sign-in"
            className="hover:opacity-90 active:scale-95 transition-all"
          >
            <Image
              src="/images/LandingPage/start-training-button.svg"
              alt="Start Training"
              width={0}
              height={0}
              className="w-60 md:w-72 h-auto"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
