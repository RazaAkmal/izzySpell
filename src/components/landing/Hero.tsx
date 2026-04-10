import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Background Image */}
      <Image
        src="/images/LandingPage/hero-bg.svg"
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
        priority
      />
      {/* Hero Foreground Image */}
      <Image
        src="/images/LandingPage/hero-img.png"
        alt=""
        width={1820}
        height={1080}
        className="relative w-full h-auto pt-28"
        priority
      />
      <div className="absolute inset-0 flex flex-col gap-3 sm:gap-4 md:gap-5 items-start justify-start pt-32 pl-6 sm:pt-48 sm:pl-10 md:pt-56 md:pl-16 lg:pt-64 lg:pl-20 xl:pt-72 xl:pl-24">
        <Image
          src="/images/LandingPage/hero-title.png"
          alt=""
          width={350}
          height={200}
          className="relative w-48 sm:w-44 md:w-56 lg:w-72 xl:w-[350px] h-auto"
          priority
        />
        <Link
          href="/sign-in"
          className="hover:opacity-90 active:scale-95 transition-all hidden md:block"
        >
          <Image
            src="/images/LandingPage/login-to-start-button.svg"
            alt="Login to Start"
            width={0}
            height={0}
            className="w-36 sm:w-44 md:w-52 lg:w-64 h-auto"
          />
        </Link>
      </div>
      <div className="relative mb-5 flex items-center justify-center">
        <Link
          href="/sign-in"
          className="hover:opacity-90 active:scale-95 transition-all block md:hidden"
        >
          <Image
            src="/images/LandingPage/login-to-start-button.svg"
            alt="Login to Start"
            width={0}
            height={0}
            className="w-36 sm:w-44 h-auto"
          />
        </Link>
      </div>
    </section>
  );
}
