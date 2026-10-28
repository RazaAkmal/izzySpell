"use client";
import React from "react";
import Image from "next/image";

const features = [
  {
    icon: "/images/LandingPage/credibility-img-1.png",
    title: "/images/LandingPage/credibility-card-title-1.png",
    titleText: "Private & Safe Learning Environment",
    description: "No ads, no distractions—just 100% child-safe learning you can trust.",
    bgColor: "/images/LandingPage/credibility-card-1.png",
  },
  {
    icon: "/images/LandingPage/credibility-img-2.png",
    title: "/images/LandingPage/credibility-card-title-2.png",
    titleText: "Track Progress & Learning Milestones",
    description: "Get weekly insights into your child's vocabulary growth and achievements.",
    bgColor: "/images/LandingPage/credibility-card-2.png",
  },
  {
    icon: "/images/LandingPage/credibility-img-3.png",
    title: "/images/LandingPage/credibility-card-title-3.png",
    titleText: "Built by Experts in Child Education",
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
        <h2 className="text-center mb-8 md:mb-10">
          <Image
            src="/images/LandingPage/build-mobile-title.svg"
            alt="Build Credibility with Parents"
            width={400}
            height={100}
            className="mx-auto w-[240px] md:hidden"
            sizes="280px"
          />
          <Image
            src="/images/LandingPage/credibility-title.png"
            alt="Build Credibility with Parents"
            width={929}
            height={87}
            className="mx-auto w-[420px] lg:w-[480px] hidden md:block"
            quality={100}
            sizes="(max-width: 1024px) 520px, 620px"
          />
        </h2>

        {/* Cards */}
        <div className="mx-auto grid w-full max-w-sm grid-cols-1 gap-8 lg:max-w-[1180px] lg:grid-cols-3 lg:gap-8 xl:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative h-full rounded-3xl transition-transform lg:hover:scale-[1.02]"
            >
              {/* Card background image — content drives the height so text never overflows */}
              <div className="relative flex h-full min-h-[240px] flex-col px-6 pb-7 pt-24 sm:px-7 lg:min-h-[300px] lg:pt-28 xl:min-h-[320px] xl:px-8 xl:pb-9">
                <Image
                  src={feature.bgColor}
                  alt=""
                  fill
                  className="object-fill rounded-3xl"
                  quality={100}
                  sizes="(max-width: 768px) 90vw, (max-width: 1280px) 30vw, 500px"
                />

                {/* Icon — overlaps the top */}
                <div className="absolute top-0 left-6 z-20 sm:left-7 xl:left-8">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={299}
                    height={299}
                    className="object-contain w-20 h-20 lg:w-24 lg:h-24"
                    quality={100}
                    sizes="96px"
                  />
                </div>

                {/* Text */}
                <div className="relative z-10 mt-auto">
                  <h3 className="mb-3">
                    <Image
                      src={feature.title}
                      alt={feature.titleText}
                      width={449}
                      height={97}
                      className="object-contain w-52 lg:w-full lg:max-w-[250px] xl:max-w-[280px] h-auto"
                      quality={100}
                      sizes="(max-width: 1024px) 208px, 280px"
                    />
                  </h3>
                  <p className="text-white text-[15px] sm:text-base xl:text-lg leading-relaxed font-semibold drop-shadow-sm">
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
