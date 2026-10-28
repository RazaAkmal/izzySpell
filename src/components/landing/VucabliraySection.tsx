"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: "/images/LandingPage/ready-icon-1.svg",
    iconClass: "w-12 h-12 md:w-[72px] md:h-[72px]",
    label: "/images/LandingPage/smart-adaptive.svg",
    labelText: "Smart & Adaptive",
    labelClass: "h-7 w-32 md:h-8 md:w-36",
    bg: "bg-[#FAE153]",
    shadow: "shadow-[inset_0_0_0_5px_rgb(239,191,0)]",
  },
  {
    icon: "/images/LandingPage/ready-icon-2.svg",
    iconClass: "w-12 h-12 md:w-[72px] md:h-[72px]",
    label: "/images/LandingPage/playful-stories.svg",
    labelText: "Playful Stories",
    labelClass: "h-7 w-28 md:h-8 md:w-32",
    bg: "bg-[#D399FF]",
    shadow: "shadow-[inset_0_0_0_5px_rgb(197,122,254)]",
  },
  {
    icon: "/images/LandingPage/ready-icon-3.svg",
    iconClass: "w-12 h-12 md:w-[72px] md:h-[72px]",
    label: "/images/LandingPage/talk-learn.svg",
    labelText: "Talk & Learn",
    labelClass: "h-7 w-28 md:h-8 md:w-32",
    bg: "bg-[#29FAFA]",
    shadow: "shadow-[inset_0_0_0_5px_rgb(43,223,223)]",
  },
  {
    icon: "/images/LandingPage/ready-icon-4.svg",
    iconClass: "w-12 h-12 md:w-[72px] md:h-[72px]",
    label: "/images/LandingPage/track-progress.svg",
    labelText: "Track Progress",
    labelClass: "h-7 w-32 md:h-8 md:w-36",
    bg: "bg-[#FF9E4A]",
    shadow: "shadow-[inset_0_0_0_5px_rgb(246,132,32)]",
  },
];

export default function VocabularySection() {
  return (
    <section id="ready-to-start" className="relative w-full overflow-hidden bg-[#EBF9FF] px-4 py-12 md:px-8 md:py-14">
      {/* Content drives the height; backgrounds cover it at every width */}
      <div className="relative mx-auto flex w-full max-w-[1608px] overflow-hidden rounded-[36px] bg-[#4CB8FA] shadow-[inset_0_0_0_6px_#14A0F2] md:rounded-[64px] md:bg-transparent md:shadow-none">
        <Image
          src="/images/LandingPage/ready-to-start.png"
          alt=""
          fill
          className="absolute inset-0 hidden w-full h-full object-cover md:block"
          quality={100}
          sizes="(max-width: 1700px) 94vw, 1608px"
        />

        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-6 px-5 py-12 sm:px-10 md:min-h-[560px] md:gap-8 md:px-24 md:py-14 lg:px-32">
          <div className="text-center">
            <h2>
              <Image
                src="/images/LandingPage/ready-to-start.svg"
                alt="Ready to Start?"
                width={400}
                height={80}
                className="object-contain w-52 sm:w-72 md:w-[360px] lg:w-[420px] mx-auto mb-3"
                sizes="(max-width: 768px) 13rem, 420px"
              />
            </h2>
            <p className="text-white text-sm sm:text-base md:text-xl max-w-[42rem] mx-auto leading-relaxed font-semibold drop-shadow">
              Unlock the full vocabulary learning experience — stories, lessons,
              progress tracking, and more. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 w-full max-w-[440px] lg:max-w-[820px] mx-auto">
            {features.map((f) => (
              <div
                key={f.bg}
                className={`${f.bg} ${f.shadow} rounded-[24px] md:rounded-[32px] w-full aspect-square flex flex-col items-center justify-center gap-3 p-4 md:p-5 transition-transform lg:hover:scale-105`}
              >
                <Image
                  src={f.icon}
                  alt=""
                  width={120}
                  height={120}
                  className={`object-contain ${f.iconClass}`}
                />
                <Image
                  src={f.label}
                  alt={f.labelText}
                  width={180}
                  height={60}
                  className={`object-contain ${f.labelClass}`}
                />
              </div>
            ))}
          </div>

          <Link
            href="/sign-in"
            className="rounded-full transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white active:scale-95"
          >
            <Image
              src="/images/LandingPage/start-trial-now-button.svg"
              alt="START FREE TRIAL NOW"
              width={320}
              height={80}
              className="w-56 sm:w-72 md:w-80 h-auto"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
