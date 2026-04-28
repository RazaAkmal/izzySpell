"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const testimonials = [
  {
    id: 1,
    name: "Sarah walik",
    role: "Mom of 6 y/o Emily",
    quote: "This app made my daughter fall in love with learning again!",
    description:
      "She's picking up new words every week and even teaching them to her little brother",
    image: "/images/LandingPage/profile.png",
    color: "pink" as const,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Dad of 5 y/o Lucas",
    quote: "The best educational app we've ever used!",
    description:
      "My son asks to learn every single day. The interactive lessons keep him engaged for hours",
    image: "/images/LandingPage/profile.png",
    color: "yellow" as const,
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Teacher, Grade 1",
    quote: "I recommend this to all my students' parents!",
    description:
      "The progress tracking helps me see exactly where each child needs more support",
    image: "/images/LandingPage/profile.png",
    color: "blue" as const,
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Dad of 7 y/o Sophia",
    quote: "Screen time I actually feel good about!",
    description:
      "Finally an app that entertains and educates at the same time. Worth every penny",
    image: "/images/LandingPage/profile.png",
    color: "pink" as const,
  },
];

const cardStyles = {
  pink: {
    bg: "bg-[#F472B6]",
    shadow:
      "shadow-[0_0_0_6px_rgba(236,72,153,0.6),0_8px_32px_rgba(236,72,153,0.4)]",
    quoteShadow: "drop-shadow-[2px_3px_0_rgba(236,72,153,0.5)]",
    quoteColor: "#F472B6",
  },
  yellow: {
    bg: "bg-[#F59E0B]",
    shadow:
      "shadow-[0_0_0_6px_rgba(217,119,6,0.6),0_8px_32px_rgba(217,119,6,0.4)]",
    quoteShadow: "drop-shadow-[2px_3px_0_rgba(217,119,6,0.5)]",
    quoteColor: "#F59E0B",
  },
  blue: {
    bg: "bg-[#60A5FA]",
    shadow:
      "shadow-[0_0_0_6px_rgba(37,99,235,0.5),0_8px_32px_rgba(37,99,235,0.4)]",
    quoteShadow: "drop-shadow-[2px_3px_0_rgba(37,99,235,0.5)]",
    quoteColor: "#60A5FA",
  },
};

function TestimonialCard({
  testimonial,
  isActive,
}: {
  testimonial: (typeof testimonials)[0];
  isActive: boolean;
}) {
  const styles = cardStyles[testimonial.color];

  return (
    <div
      className={cn(
        "relative rounded-[65px] p-6 sm:p-8 transition-all duration-500 overflow-hidden",
        styles.bg,
        styles.shadow,
        isActive ? "scale-100 opacity-100" : "scale-90 opacity-70",
      )}
      style={{
        minHeight: "320px",
      }}
    >
      {/* Background Large Quote Marks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Open quote - top right */}
        <div className="absolute top-4 left-4 w-20 h-20 md:w-24 md:h-24 -z-10">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 182 184"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M97.5199 100.14C83.3708 53.6827 98.6559 20.5269 137.778 8.61181C143.891 6.75008 149.083 9.17659 150.944 15.2894L153.799 24.6623C155.785 31.1826 153.483 36.7823 147.211 39.5832C130.024 47.4894 126.464 54.8082 128.185 66.3076L128.522 68.8769C150.121 62.2987 166.124 73.9017 171.585 91.8325C177.17 110.171 166.401 130.373 148.062 135.958C128.501 141.916 107.325 132.334 97.5199 100.14ZM13.1822 130.279C-0.966957 83.8221 14.3182 50.6663 53.44 38.7512C59.5528 36.8895 64.745 39.316 66.6067 45.4288L69.4614 54.8017C71.4472 61.322 69.1448 66.9217 62.8728 69.7226C45.6866 77.6288 42.1265 84.9476 43.8476 96.447L44.1847 99.0163C65.7832 92.4382 81.786 104.041 87.2471 121.972C92.8323 140.31 82.063 160.512 63.7246 166.098C44.1637 172.055 22.9873 162.473 13.1822 130.279Z"
              fill="#EDF9FF"
            />
            <path
              d="M91.0735 120.806C97.3023 141.258 85.3414 163.695 64.8898 169.924C54.1077 173.208 42.6996 172.233 32.6558 165.875C22.6648 159.551 14.4522 148.178 9.35577 131.445C2.10072 107.624 2.22556 86.6698 9.68054 69.9346C17.1785 53.103 31.8176 41.1555 52.275 34.9249C56.0893 33.7633 60.0003 33.8328 63.3946 35.516C66.8253 37.2173 69.2332 40.3237 70.4332 44.2636L73.2873 53.6363C74.4991 57.6151 74.4944 61.6453 72.9338 65.2471C71.3639 68.8704 68.4044 71.6335 64.5043 73.3752L64.5052 73.3747C56.1533 77.2213 51.8008 80.6353 49.6026 83.9487C47.7817 86.6935 47.1702 89.7869 47.5782 94.0334C57.5013 92.0172 66.4449 93.5551 73.7875 97.8512C82.1789 102.761 88.1008 111.046 91.0735 120.806ZM175.411 90.6665C181.64 111.118 169.68 133.556 149.228 139.785C138.446 143.069 127.038 142.093 116.994 135.735C107.003 129.411 98.79 118.039 93.6936 101.305C86.4385 77.4838 86.5633 56.53 94.0184 39.7947C101.516 22.9632 116.155 11.0161 136.612 4.7855C140.426 3.62379 144.338 3.69295 147.732 5.37612C151.163 7.07738 153.571 10.1839 154.771 14.1237L157.626 23.4972C158.837 27.4759 158.833 31.5063 157.272 35.1081C155.708 38.7184 152.763 41.4741 148.883 43.2168L148.883 43.2173C140.505 47.0713 136.143 50.4911 133.941 53.8096C132.12 56.5544 131.508 59.6473 131.916 63.8935C141.839 61.8774 150.783 63.4152 158.125 67.7113C166.517 72.6211 172.439 80.9064 175.411 90.6665Z"
              stroke="white"
              strokeOpacity="0.6"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* Close quote - bottom left (flipped) */}
        <div className="absolute bottom-4 right-4 w-20 h-20 md:w-24 md:h-24 rotate-180">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 182 184"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M97.5199 100.14C83.3708 53.6827 98.6559 20.5269 137.778 8.61181C143.891 6.75008 149.083 9.17659 150.944 15.2894L153.799 24.6623C155.785 31.1826 153.483 36.7823 147.211 39.5832C130.024 47.4894 126.464 54.8082 128.185 66.3076L128.522 68.8769C150.121 62.2987 166.124 73.9017 171.585 91.8325C177.17 110.171 166.401 130.373 148.062 135.958C128.501 141.916 107.325 132.334 97.5199 100.14ZM13.1822 130.279C-0.966957 83.8221 14.3182 50.6663 53.44 38.7512C59.5528 36.8895 64.745 39.316 66.6067 45.4288L69.4614 54.8017C71.4472 61.322 69.1448 66.9217 62.8728 69.7226C45.6866 77.6288 42.1265 84.9476 43.8476 96.447L44.1847 99.0163C65.7832 92.4382 81.786 104.041 87.2471 121.972C92.8323 140.31 82.063 160.512 63.7246 166.098C44.1637 172.055 22.9873 162.473 13.1822 130.279Z"
              fill="#EDF9FF"
            />
            <path
              d="M91.0735 120.806C97.3023 141.258 85.3414 163.695 64.8898 169.924C54.1077 173.208 42.6996 172.233 32.6558 165.875C22.6648 159.551 14.4522 148.178 9.35577 131.445C2.10072 107.624 2.22556 86.6698 9.68054 69.9346C17.1785 53.103 31.8176 41.1555 52.275 34.9249C56.0893 33.7633 60.0003 33.8328 63.3946 35.516C66.8253 37.2173 69.2332 40.3237 70.4332 44.2636L73.2873 53.6363C74.4991 57.6151 74.4944 61.6453 72.9338 65.2471C71.3639 68.8704 68.4044 71.6335 64.5043 73.3752L64.5052 73.3747C56.1533 77.2213 51.8008 80.6353 49.6026 83.9487C47.7817 86.6935 47.1702 89.7869 47.5782 94.0334C57.5013 92.0172 66.4449 93.5551 73.7875 97.8512C82.1789 102.761 88.1008 111.046 91.0735 120.806ZM175.411 90.6665C181.64 111.118 169.68 133.556 149.228 139.785C138.446 143.069 127.038 142.093 116.994 135.735C107.003 129.411 98.79 118.039 93.6936 101.305C86.4385 77.4838 86.5633 56.53 94.0184 39.7947C101.516 22.9632 116.155 11.0161 136.612 4.7855C140.426 3.62379 144.338 3.69295 147.732 5.37612C151.163 7.07738 153.571 10.1839 154.771 14.1237L157.626 23.4972C158.837 27.4759 158.833 31.5063 157.272 35.1081C155.708 38.7184 152.763 41.4741 148.883 43.2168L148.883 43.2173C140.505 47.0713 136.143 50.4911 133.941 53.8096C132.12 56.5544 131.508 59.6473 131.916 63.8935C141.839 61.8774 150.783 63.4152 158.125 67.7113C166.517 72.6211 172.439 80.9064 175.411 90.6665Z"
              stroke="white"
              strokeOpacity="0.6"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none -z-20">
        <Image
          src="/images/LandingPage/corner-1.svg"
          alt=""
          width={80}
          height={80}
          className="absolute top-0 left-0"
        />
        <Image
          src="/images/LandingPage/corner-2.svg"
          alt=""
          width={80}
          height={80}
          className="absolute top-0 right-0"
        />
        <Image
          src="/images/LandingPage/corner-3.svg"
          alt=""
          width={80}
          height={80}
          className="absolute bottom-0 left-0"
        />
        <Image
          src="/images/LandingPage/corner-4.svg"
          alt=""
          width={80}
          height={80}
          className="absolute bottom-0 right-0"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center h-full pt-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">
          <div className="absolute inset-0 rounded-full bg-white/30 blur-sm" />
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            width={155}
            height={155}
            className="relative rounded-full border-3 border-white object-cover w-full h-full"
            quality={100}
            sizes="80px"
          />
        </div>

        {/* Name and Role */}
        <h3 className=" font-bold text-white text-lg sm:text-xl">
          {testimonial.name}
        </h3>
        <p className=" text-white/80 text-sm">{testimonial.role}</p>

        {/* Quote */}
        <blockquote className=" text-white text-xl sm:text-2xl md:text-3xl leading-tight mb-3 sm:mb-4 italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]">
          &quot;{testimonial.quote}&quot;
        </blockquote>

        {/* Description */}
        <p className=" text-white/90 h-28 text-sm sm:text-base max-w-xs leading-relaxed">
          {testimonial.description}
        </p>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Decorative Quote Marks */}
      <Image
        src="/images/LandingPage/open-quote.svg"
        alt=""
        fill
        className="object-contain opacity-50 absolute !top-8 !left-4 sm:!top-12 sm:!left-8 md:!top-16 md:!left-16 !w-24 !h-24 sm:!w-32 sm:!h-32 md:!w-44 md:!h-44"
        aria-hidden="true"
        sizes="(max-width: 640px) 6rem, (max-width: 768px) 8rem, 11rem"
      />
      <Image
        src="/images/LandingPage/close-quote.svg"
        alt=""
        fill
        className="object-contain opacity-50 absolute !top-auto !left-auto !bottom-8 !right-4 sm:!right-8 md:!bottom-16 md:!right-16 !w-24 !h-24 sm:!w-32 sm:!h-32 md:!w-44 md:!h-44"
        aria-hidden="true"
        sizes="(max-width: 640px) 6rem, (max-width: 768px) 8rem, 11rem"
      />
      <div className="px-4 relative z-10">
        {/* Title */}
        <div className="flex justify-center mb-10 sm:mb-12 md:mb-16">
          <Image
            src="/images/LandingPage/testimonial-title.png"
            alt="Loved by Parents & Teachers"
            width={910}
            height={87}
            className="object-contain w-[280px] sm:w-[400px] md:w-[520px] lg:w-[600px]"
            quality={100}
            sizes="(max-width: 640px) 280px, (max-width: 768px) 400px, (max-width: 1024px) 520px, 600px"
          />
        </div>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full content-center h-[400px] mx-auto carousel-container"
        >
          <CarouselContent className="-ml-4 md:-ml-6 !overflow-visible">
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={testimonial.id}
                className="pl-4 md:pl-6 basis-[85%] sm:basis-[70%] md:basis-[50%] lg:basis-[40%]"
              >
                <TestimonialCard
                  testimonial={testimonial}
                  isActive={index === current}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mt-12 sm:mt-10 md:mt-16">
          {/* Previous Button */}
          <button
            onClick={() => api?.scrollPrev()}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#3B82F6] hover:text-[#2563EB] transition-colors"
            aria-label="Previous testimonial"
          >
            <Image
              src="/images/LandingPage/prev.svg"
              alt="Previous"
              width={32}
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2 sm:gap-3">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  index === current
                    ? "w-3 h-3 sm:w-4 sm:h-4 bg-white ring-4 ring-[#4ABFFC]"
                    : "w-2 h-2 sm:w-3 sm:h-3 bg-[#4ABFFC] ring-4 ring-[#FFFFFF]",
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => api?.scrollNext()}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#3B82F6] hover:text-[#2563EB] transition-colors"
            aria-label="Next testimonial"
          >
            <Image
              src="/images/LandingPage/next.svg"
              alt="Next"
              width={32}
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
