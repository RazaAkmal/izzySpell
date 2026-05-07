"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const bullets = [
  "Your child can learn 150+ new words in their first month",
  "Weekly reports with skill badges & fun activities",
  "Track learning milestones anytime, anywhere",
];

export default function RealProgress() {
  return (
    <section className="relative w-full overflow-hidden py-8 md:py-12 bg-[#EBF9FF]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 xl:px-16">
        <div
          className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-12 bg-[#F97755]"
          style={{ boxShadow: "inset 0 0 0 8px rgba(255,255,255,0.22)" }}
        >
          <div className="relative z-10 grid w-full gap-6 lg:grid-cols-[1.3fr_1fr] items-center">
            {/* Left: text */}
            <div className="space-y-5">
              <div className="max-w-[18rem] sm:max-w-[34rem]">
                <Image
                  src="/images/LandingPage/progress-mobile-title.svg"
                  alt="See Real Progress in Just Weeks!"
                  width={660}
                  height={100}
                  className="w-full h-auto md:hidden"
                  sizes="(max-width: 640px) 18rem, 34rem"
                />
                <Image
                  src="/images/LandingPage/real-progress-title.png"
                  alt="See Real Progress in Just Weeks!"
                  width={660}
                  height={65}
                  className="w-full h-auto hidden md:block"
                  quality={100}
                  sizes="(max-width: 1024px) 34rem, 600px"
                />
              </div>

              <ul className="space-y-3">
                {bullets.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-flex h-3 w-3 flex-shrink-0 rounded-full border-[3px] border-white" />
                    <span className="text-white font-bold text-base md:text-lg leading-snug drop-shadow">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-in"
                className="hover:opacity-90 active:scale-95 transition-all inline-block"
              >
                <Image
                  src="/images/LandingPage/see-live-demo-button.svg"
                  alt="SEE LIVE DEMO"
                  width={224}
                  height={64}
                  className="w-48 md:w-56 h-auto"
                />
              </Link>
            </div>

            {/* Right: illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[26rem]">
                <Image
                  src="/images/LandingPage/real-progress.svg"
                  alt="Real progress illustration"
                  width={560}
                  height={400}
                  className="w-full h-auto lg:absolute lg:-top-52 lg:left-4"
                  sizes="(max-width: 1024px) 26rem, 560px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
