"use client";
import React from "react";
import Image from "next/image";

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}

const features: FeatureCard[] = [
  {
    icon: "/images/LandingPage/credibility-img-1.png",
    title: "/images/LandingPage/credibility-card-title-1.png",
    description:
      "No ads, no distractions—just 100% child-safe learning you can trust.",
    bgColor: "/images/LandingPage/credibility-card-1.png",
  },
  {
    icon: "/images/LandingPage/credibility-img-2.png",
    title: "/images/LandingPage/credibility-card-title-2.png",
    description:
      "Get weekly insights into your child's vocabulary growth and achievements.",
    bgColor: "/images/LandingPage/credibility-card-2.png",
  },
  {
    icon: "/images/LandingPage/credibility-img-3.png",
    title: "/images/LandingPage/credibility-card-title-3.png",
    description:
      "Designed in collaboration with certified educators and child development specialists.",
    bgColor: "/images/LandingPage/credibility-card-3.png",
  },
];

export default function CredibilityFeatures() {
  return (
    <section className="w-full py-20 px-4 bg-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-32">
          <Image
            src="/images/LandingPage/build-mobile-title.svg"
            alt="Why Choose Us?"
            width={400}
            height={100}
            className="mx-auto w-[320px] md:hidden"
            sizes="320px"
          />
          <Image
            src="/images/LandingPage/credibility-title.png"
            alt="Why Choose Us?"
            width={929}
            height={87}
            className="mx-auto w-[320px] md:w-[500px] hidden md:block"
            quality={100}
            sizes="(max-width: 768px) 320px, 500px"
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              {/* Main card background */}
              <div className="relative rounded-4xl h-full pt-32 px-8 pb-8 flex flex-col items-start">
                {/* Background image */}
                <Image
                  src={feature.bgColor}
                  alt=""
                  fill
                  className="object-fill rounded-4xl"
                  quality={100}
                  sizes="(max-width: 768px) 90vw, 33vw"
                />

                {/* Icon container - positioned absolutely at top */}
                <div className="absolute top-0 left-8 z-20 flex justify-start">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={299}
                    height={299}
                    className="object-contain w-40 h-40"
                    quality={100}
                    sizes="160px"
                  />
                </div>

                {/* Text content */}
                <div className="relative z-10 pt-8">
                  <div className="mb-6">
                    <Image
                      src={feature.title}
                      alt=""
                      width={449}
                      height={97}
                      className="object-contain"
                      quality={100}
                      sizes="240px"
                    />
                  </div>
                  <p className="text-white text-2xl leading-relaxed font-bold drop-shadow-lg">
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
