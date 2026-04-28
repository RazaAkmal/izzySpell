"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: "/images/LandingPage/ready-icon-1.svg",
    iconClass: "w-[4rem] h-[4rem] lg:w-[8rem] lg:h-[8rem] mb-2",
    label: "/images/LandingPage/smart-adaptive.svg",
    labelClass: "h-[40px] w-[180px]",
    bg: "bg-[#FAE153]",
    shadow: "shadow-[inset_0_0_0_6px_rgb(239,191,0)]",
  },
  {
    icon: "/images/LandingPage/ready-icon-2.svg",
    iconClass: "w-[3.5rem] h-[3.5rem] lg:w-[7rem] lg:h-[7rem] mb-2",
    label: "/images/LandingPage/playful-stories.svg",
    labelClass: "h-[40px] w-[160px]",
    bg: "bg-[#D399FF]",
    shadow: "shadow-[inset_0_0_0_6px_rgb(197,122,254)]",
  },
  {
    icon: "/images/LandingPage/ready-icon-3.svg",
    iconClass: "w-[3.5rem] h-[3.5rem] lg:w-[7rem] lg:h-[7rem] mb-2",
    label: "/images/LandingPage/talk-learn.svg",
    labelClass: "h-[40px] w-[150px]",
    bg: "bg-[#29FAFA]",
    shadow: "shadow-[inset_0_0_0_6px_rgb(43,223,223)]",
  },
  {
    icon: "/images/LandingPage/ready-icon-4.svg",
    iconClass: "w-[4rem] h-[4rem] lg:w-[8rem] lg:h-[8rem] mb-2",
    label: "/images/LandingPage/track-progress.svg",
    labelClass: "h-[40px] w-[170px]",
    bg: "bg-[#FF9E4A]",
    shadow: "shadow-[inset_0_0_0_6px_rgb(246,132,32)]",
  },
];

export default function VocabularySection() {
  return (
    <section className="w-full p-6 md:p-10 lg:p-16">
      <div className="max-w-7xl mx-auto">
        <div className="relative px-0 md:px-8 py-6 md:py-12 flex flex-col items-center gap-8">
          {/* Decorative bg pattern */}
          <Image
            src="/images/LandingPage/ready-to-start-mobile-bg.svg"
            alt=""
            fill
            className="object-fill pointer-events-none sm:hidden"
          />
          <Image
            src="/images/LandingPage/ready-to-start.png"
            alt=""
            fill
            className="object-fill pointer-events-none hidden sm:block"
          />
          {/* Title */}
          <div className="relative z-10 text-center justify-items-center">
            <Image
              src="/images/LandingPage/ready-to-start.svg"
              alt="Ready to Start?"
              width={400}
              height={80}
              className="object-contain w-44 md:w-96"
            />
            <p className="text-white text-sm sm:text-lg max-w-[16.5rem] md:max-w-lg mx-auto leading-relaxed font-semibold drop-shadow-lg">
              Unlock the full vocabulary learning experience — stories, lessons,
              progress tracking, and more. No credit card required.
            </p>
          </div>

          {/* Feature cards */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-4 gap-4 w-full justify-items-center max-w-5xl mx-auto">
            {features.map((f) => (
              <div
                key={f.bg}
                className={`${f.bg} ${f.shadow} max-w-[135px] max-h-[135px] md:max-h-[250px] md:max-w-[250px] rounded-[30px] justify-between md:rounded-[50px] w-full h-full aspect-square flex flex-col items-center px-3 py-6`}
              >
                <Image
                  src={f.icon}
                  alt={f.label}
                  width={80}
                  height={80}
                  className={`object-contain ${f.iconClass}`}
                />
                <Image
                  src={f.label}
                  alt={f.label}
                  width={120}
                  height={40}
                  className={`object-contain ${f.labelClass}`}
                />
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div className="relative z-10 flex items-center justify-center">
            <Link
              href="/signup"
              className="hover:opacity-90 active:scale-95 transition-all"
            >
              <Image
                src="/images/LandingPage/start-trial-now-button.svg"
                alt="START FREE TRIAL NOW"
                width={0}
                height={0}
                className="w-44 sm:w-80 h-auto"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
