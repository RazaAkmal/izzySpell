import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Background SVG (vector — pixel-perfect at any size) */}
      <Image
        src="/images/LandingPage/hero-bg.svg"
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
        priority
        sizes="100vw"
      />
      {/* Hero Foreground Image (intrinsic 1728×1622) */}
      <Image
        src="/images/LandingPage/hero-img.png"
        alt=""
        width={1728}
        height={1622}
        className="relative w-full h-auto pt-28"
        priority
        quality={100}
        sizes="100vw"
      />
      <div className="absolute inset-0 flex flex-col gap-3 sm:gap-4 md:gap-5 items-start justify-start pt-32 pl-6 sm:pt-48 sm:pl-10 md:pt-56 md:pl-16 lg:pt-64 lg:pl-20 xl:pt-72 xl:pl-24">
        <Image
          src="/images/LandingPage/hero-title.png"
          alt="Spell Play Learn"
          width={594}
          height={292}
          className="relative w-48 sm:w-44 md:w-56 lg:w-72 xl:w-[350px] h-auto"
          priority
          quality={100}
          sizes="(max-width: 640px) 12rem, (max-width: 768px) 11rem, (max-width: 1024px) 14rem, (max-width: 1280px) 18rem, 350px"
        />
        <Link
          href="/sign-in"
          className="hover:opacity-90 active:scale-95 transition-all hidden md:block"
        >
          <Image
            src="/images/LandingPage/login-to-start-button.svg"
            alt="Login to Start"
            width={256}
            height={64}
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
            width={176}
            height={48}
            className="w-36 sm:w-44 h-auto"
          />
        </Link>
      </div>
    </section>
  );
}
