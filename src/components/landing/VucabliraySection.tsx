"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: "/images/LandingPage/ready-icon-1.svg",
    iconClass: "w-14 h-14 md:w-20 md:h-20",
    label: "/images/LandingPage/smart-adaptive.svg",
    labelClass: "h-8 w-36 md:h-10 md:w-44",
    bg: "bg-[#FAE153]",
    shadow: "shadow-[inset_0_0_0_5px_rgb(239,191,0)]",
  },
  {
    icon: "/images/LandingPage/ready-icon-2.svg",
    iconClass: "w-12 h-12 md:w-20 md:h-20",
    label: "/images/LandingPage/playful-stories.svg",
    labelClass: "h-8 w-32 md:h-10 md:w-40",
    bg: "bg-[#D399FF]",
    shadow: "shadow-[inset_0_0_0_5px_rgb(197,122,254)]",
  },
  {
    icon: "/images/LandingPage/ready-icon-3.svg",
    iconClass: "w-12 h-12 md:w-20 md:h-20",
    label: "/images/LandingPage/talk-learn.svg",
    labelClass: "h-8 w-32 md:h-10 md:w-40",
    bg: "bg-[#29FAFA]",
    shadow: "shadow-[inset_0_0_0_5px_rgb(43,223,223)]",
  },
  {
    icon: "/images/LandingPage/ready-icon-4.svg",
    iconClass: "w-14 h-14 md:w-20 md:h-20",
    label: "/images/LandingPage/track-progress.svg",
    labelClass: "h-8 w-36 md:h-10 md:w-44",
    bg: "bg-[#FF9E4A]",
    shadow: "shadow-[inset_0_0_0_5px_rgb(246,132,32)]",
  },
];

export default function VocabularySection() {
  return (
    <section id="ready-to-start" className="relative w-full overflow-hidden bg-[#EBF9FF] px-4 py-12 md:px-8 md:py-20">
      <div className="relative mx-auto aspect-[1608/768] w-full max-w-[1608px] min-h-[640px] overflow-hidden rounded-[42px] md:min-h-0 md:rounded-[64px]">
        <Image
          src="/images/LandingPage/ready-to-start-mobile-bg.svg"
          alt=""
          fill
          className="absolute inset-0 w-full h-full object-cover sm:hidden"
          sizes="100vw"
        />
        <Image
          src="/images/LandingPage/ready-to-start.png"
          alt=""
          fill
          className="absolute inset-0 hidden w-full h-full object-fill sm:block"
          quality={100}
          sizes="(max-width: 1700px) 94vw, 1608px"
        />

        <div className="relative z-10 flex h-full min-h-[640px] flex-col items-center justify-center gap-6 px-6 py-12 md:min-h-0 md:gap-8 md:px-20 md:py-14">
          <div className="text-center">
            <Image
              src="/images/LandingPage/ready-to-start.svg"
              alt="Ready to Start?"
              width={400}
              height={80}
              className="object-contain w-44 md:w-[420px] mx-auto mb-3"
              sizes="(max-width: 768px) 11rem, 420px"
            />
            <p className="text-white text-sm sm:text-base md:text-xl max-w-[42rem] mx-auto leading-relaxed font-semibold drop-shadow">
              Unlock the full vocabulary learning experience — stories, lessons,
              progress tracking, and more. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 w-full max-w-[1300px] mx-auto">
            {features.map((f) => (
              <div
                key={f.bg}
                className={`${f.bg} ${f.shadow} rounded-[28px] md:rounded-[40px] w-full aspect-square flex flex-col items-center justify-between p-4 md:p-7 transition-transform hover:scale-105`}
              >
                <Image
                  src={f.icon}
                  alt=""
                  width={120}
                  height={120}
                  className={`object-contain ${f.iconClass} lg:w-28 lg:h-28`}
                />
                <Image
                  src={f.label}
                  alt=""
                  width={180}
                  height={60}
                  className={`object-contain ${f.labelClass} lg:h-12 lg:w-52`}
                />
              </div>
            ))}
          </div>

          <Link
            href="/sign-in"
            className="hover:opacity-90 active:scale-95 transition-all"
          >
            <Image
              src="/images/LandingPage/start-trial-now-button.svg"
              alt="START FREE TRIAL NOW"
              width={320}
              height={80}
              className="w-48 sm:w-72 md:w-80 h-auto"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
