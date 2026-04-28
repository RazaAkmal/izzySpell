"use client";
import React from "react";
import Image from "next/image";

const bullets = [
  "Your child can learn 150+ new words in their first month",
  "Weekly reports with skill badges & fun activities",
  "Track learning milestones anytime, anywhere",
];

export default function RealProgress() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-[3rem] p-6 sm:p-8 md:p-12 bg-[#F97755] border border-white/20 shadow-[inset_0_0_0_8px_rgba(255,255,255,0.24)]">
          <div className="relative z-10 grid w-full gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
            <div className="space-y-8">
              <div className="max-w-[16rem] sm:max-w-[30rem] mt-8 md:mt-0">
                <Image
                  src="/images/LandingPage/progress-mobile-title.svg"
                  alt="See Real Progress in Just Weeks!"
                  width={660}
                  height={100}
                  className="w-full h-auto md:hidden"
                  sizes="(max-width: 640px) 16rem, 30rem"
                />
                <Image
                  src="/images/LandingPage/real-progress-title.png"
                  alt="See Real Progress in Just Weeks!"
                  width={660}
                  height={65}
                  className="w-full h-auto hidden md:block"
                  quality={100}
                  sizes="(max-width: 1024px) 30rem, 660px"
                />
              </div>

              <ul className="space-y-4">
                {bullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 inline-flex h-3 w-3 rounded-full border-[3px] border-white" />
                    <span className="text-white font-bold text-base sm:text-lg md:text-xl leading-snug drop-shadow-md">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-3 hidden lg:flex items-center justify-start">
                <button
                  type="button"
                  className="hover:opacity-90 active:scale-95 transition-all"
                >
                  <Image
                    src="/images/LandingPage/see-live-demo-button.svg"
                    alt="SEE LIVE DEMO"
                    width={224}
                    height={64}
                    className="w-56 h-auto"
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[28rem] sm:max-w-[32rem]">
                <Image
                  src="/images/LandingPage/real-progress.svg"
                  alt="Illustration of real progress"
                  width={560}
                  height={400}
                  className="object-contain lg:absolute -top-64 left-10 w-full h-auto"
                  sizes="(max-width: 640px) 28rem, (max-width: 1024px) 32rem, 560px"
                />
              </div>
            </div>
            <div className="relative flex mt-3 lg:hidden items-center justify-center">
              <button
                type="button"
                className="hover:opacity-90 active:scale-95 transition-all"
              >
                <Image
                  src="/images/LandingPage/see-live-demo-button.svg"
                  alt="SEE LIVE DEMO"
                  width={176}
                  height={56}
                  className="w-44 h-auto"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
