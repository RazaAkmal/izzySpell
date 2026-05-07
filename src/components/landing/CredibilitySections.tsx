"use client";
import React from "react";
import Image from "next/image";

const features = [
  {
    icon: "/images/LandingPage/credibility-img-1.png",
    title: "/images/LandingPage/credibility-card-title-1.png",
    description: "No ads, no distractions—just 100% child-safe learning you can trust.",
    bgColor: "/images/LandingPage/credibility-card-1.png",
  },
  {
    icon: "/images/LandingPage/credibility-img-2.png",
    title: "/images/LandingPage/credibility-card-title-2.png",
    description: "Get weekly insights into your child's vocabulary growth and achievements.",
    bgColor: "/images/LandingPage/credibility-card-2.png",
  },
  {
    icon: "/images/LandingPage/credibility-img-3.png",
    title: "/images/LandingPage/credibility-card-title-3.png",
    description: "Designed in collaboration with certified educators and child development specialists.",
    bgColor: "/images/LandingPage/credibility-card-3.png",
  },
];

export default function CredibilityFeatures() {
  return (
    <section id="credibility" className="relative w-full overflow-hidden bg-[#EBF9FF]">
      {/* Content drives height */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 xl:px-16 flex flex-col py-12 md:py-16">
        {/* Title */}
        <div className="text-center mb-8 md:mb-10">
          <Image
            src="/images/LandingPage/build-mobile-title.svg"
            alt="Build Credibility with Parents"
            width={400}
            height={100}
            className="mx-auto w-[280px] md:hidden"
            sizes="280px"
          />
          <Image
            src="/images/LandingPage/credibility-title.png"
            alt="Build Credibility with Parents"
            width={929}
            height={87}
            className="mx-auto w-[520px] lg:w-[620px] hidden md:block"
            quality={100}
            sizes="(max-width: 1024px) 520px, 620px"
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 xl:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-3xl overflow-hidden transition-transform hover:scale-[1.02]"
            >
              {/* Card background image */}
              <div className="relative aspect-[516/616] px-6 pb-6 pt-24 md:px-8 md:pb-10 md:pt-40 xl:px-10 xl:pb-12 xl:pt-48 flex flex-col">
                <Image
                  src={feature.bgColor}
                  alt=""
                  fill
                  className="object-fill rounded-3xl"
                  quality={100}
                  sizes="(max-width: 768px) 90vw, (max-width: 1280px) 30vw, 500px"
                />

                {/* Icon — overlaps the top */}
                <div className="absolute -top-2 left-6 z-20 md:left-8 xl:left-10">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={299}
                    height={299}
                    className="object-contain w-28 h-28 md:w-40 md:h-40 xl:w-44 xl:h-44"
                    quality={100}
                    sizes="(max-width: 768px) 112px, (max-width: 1280px) 160px, 176px"
                  />
                </div>

                {/* Text */}
                <div className="relative z-10 mt-auto">
                  <div className="mb-3 md:mb-8">
                    <Image
                      src={feature.title}
                      alt=""
                      width={449}
                      height={97}
                      className="object-contain w-48 md:w-[320px] xl:w-[360px] h-auto"
                      quality={100}
                      sizes="(max-width: 768px) 192px, (max-width: 1280px) 320px, 360px"
                    />
                  </div>
                  <p className="text-white text-base md:text-2xl xl:text-[28px] leading-relaxed font-bold drop-shadow">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
