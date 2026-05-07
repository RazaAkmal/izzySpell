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
    name: "Sarah Malik",
    role: "Mom of 6 y/o Emily",
    quote: "This app made my daughter fall in love with learning again!",
    description: "She's picking up new words every week and even teaching them to her little brother",
    image: "/images/LandingPage/profile.png",
    color: "pink" as const,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Dad of 5 y/o Lucas",
    quote: "The best educational app we've ever used!",
    description: "My son asks to learn every single day. The interactive lessons keep him engaged for hours",
    image: "/images/LandingPage/profile.png",
    color: "yellow" as const,
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Teacher, Grade 1",
    quote: "I recommend this to all my students' parents!",
    description: "The progress tracking helps me see exactly where each child needs more support",
    image: "/images/LandingPage/profile.png",
    color: "blue" as const,
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Dad of 7 y/o Sophia",
    quote: "Screen time I actually feel good about!",
    description: "Finally an app that entertains and educates at the same time. Worth every penny",
    image: "/images/LandingPage/profile.png",
    color: "pink" as const,
  },
];

const cardStyles = {
  pink: {
    bg: "bg-[#F472B6]",
    ring: "shadow-[0_0_0_5px_rgba(236,72,153,0.5),0_8px_24px_rgba(236,72,153,0.3)]",
  },
  yellow: {
    bg: "bg-[#F59E0B]",
    ring: "shadow-[0_0_0_5px_rgba(217,119,6,0.5),0_8px_24px_rgba(217,119,6,0.3)]",
  },
  blue: {
    bg: "bg-[#60A5FA]",
    ring: "shadow-[0_0_0_5px_rgba(37,99,235,0.4),0_8px_24px_rgba(37,99,235,0.3)]",
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
        styles.ring,
        isActive ? "scale-100 opacity-100" : "scale-90 opacity-65",
      )}
      style={{ minHeight: "320px" }}
    >
      {/* Corner decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <Image src="/images/LandingPage/corner-1.svg" alt="" width={64} height={64} className="absolute top-0 left-0" />
        <Image src="/images/LandingPage/corner-2.svg" alt="" width={64} height={64} className="absolute top-0 right-0" />
        <Image src="/images/LandingPage/corner-3.svg" alt="" width={64} height={64} className="absolute bottom-0 left-0" />
        <Image src="/images/LandingPage/corner-4.svg" alt="" width={64} height={64} className="absolute bottom-0 right-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-2">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-1">
          <div className="absolute inset-0 rounded-full bg-white/30 blur-sm" />
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            width={155}
            height={155}
            className="relative rounded-full border-2 border-white object-cover w-full h-full"
            quality={100}
            sizes="64px"
          />
        </div>

        <h3 className="font-bold text-white text-lg sm:text-xl leading-tight">{testimonial.name}</h3>
        <p className="text-white/80 text-sm">{testimonial.role}</p>

        <blockquote className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-tight italic drop-shadow mt-1">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        <p className="text-white/90 text-sm sm:text-base max-w-xs leading-relaxed h-28">
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
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <section className="relative w-full overflow-hidden bg-[#EBF9FF]">
      {/* Content drives height */}
      <div className="flex flex-col py-12 md:py-16">
        {/* Title */}
        <div className="flex justify-center mb-8 md:mb-10 px-4">
          <Image
            src="/images/LandingPage/testimonial-title.png"
            alt="Loved by Parents & Teachers"
            width={910}
            height={87}
            className="object-contain w-[260px] sm:w-[380px] md:w-[500px] lg:w-[580px]"
            quality={100}
            sizes="(max-width: 640px) 260px, (max-width: 768px) 380px, (max-width: 1024px) 500px, 580px"
          />
        </div>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          opts={{ align: "center", loop: true }}
          className="w-full mx-auto"
        >
          <CarouselContent className="-ml-4 md:-ml-5 !overflow-visible">
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={testimonial.id}
                className="pl-4 md:pl-5 basis-[88%] sm:basis-[72%] md:basis-[48%] lg:basis-[38%]"
              >
                <TestimonialCard testimonial={testimonial} isActive={index === current} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6 mt-8 md:mt-10 px-4">
          <button
            onClick={() => api?.scrollPrev()}
            className="w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-70"
            aria-label="Previous"
          >
            <Image src="/images/LandingPage/prev.svg" alt="Previous" width={32} height={32} className="w-8 h-8 object-contain" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  index === current
                    ? "w-3.5 h-3.5 bg-white ring-4 ring-[#4ABFFC]"
                    : "w-2.5 h-2.5 bg-[#4ABFFC] ring-3 ring-white",
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => api?.scrollNext()}
            className="w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-70"
            aria-label="Next"
          >
            <Image src="/images/LandingPage/next.svg" alt="Next" width={32} height={32} className="w-8 h-8 object-contain" />
          </button>
        </div>
      </div>
    </section>
  );
}
