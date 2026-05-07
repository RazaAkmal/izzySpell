import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[680px] md:min-h-screen overflow-hidden bg-[#3BB5F5] pb-8">
      {/* Background sky — fills the viewport */}
      <Image
        src="/images/LandingPage/hero-bg.svg"
        alt=""
        fill
        className="absolute inset-0 w-full h-full object-cover object-top"
        priority
        sizes="100vw"
      />

      <div className="absolute inset-0 mx-auto w-full max-w-[1400px]">
        <div className="absolute inset-x-0 top-[96px] md:hidden pointer-events-none">
          <Image
            src="/images/LandingPage/hero-img.png"
            alt=""
            width={1728}
            height={1622}
            className="w-full h-auto"
            priority
            quality={100}
            sizes="100vw"
          />
        </div>

        <div
          className="absolute bottom-0 right-[-7%] hidden md:block pointer-events-none w-[68%] max-w-[960px] min-w-[560px]"
          style={{ aspectRatio: "1728 / 1622" }}
        >
          <Image
            src="/images/LandingPage/hero-img.png"
            alt=""
            fill
            className="absolute inset-0 w-full h-full object-contain object-bottom"
            priority
            quality={100}
            sizes="(max-width: 1024px) 68vw, (max-width: 1440px) 62vw, 960px"
          />
        </div>

        <div className="absolute bottom-6 left-5 z-10 flex flex-col gap-3 items-start sm:left-8 sm:bottom-8 md:hidden">
          <Image
            src="/images/LandingPage/hero-title.png"
            alt="Spell Play Learn"
            width={594}
            height={292}
            className="w-40 sm:w-52 h-auto drop-shadow-md"
            priority
            quality={100}
            sizes="(max-width: 640px) 10rem, 13rem"
          />
          <Link href="/sign-in" className="hover:opacity-90 active:scale-95 transition-all">
            <Image
              src="/images/LandingPage/login-to-start-button.svg"
              alt="Login to Start"
              width={256}
              height={64}
              className="w-36 sm:w-44 h-auto"
            />
          </Link>
        </div>

        <div className="absolute inset-y-0 left-[4%] hidden md:flex flex-col gap-5 items-start justify-center pt-16 lg:left-[6%]">
          <Image
            src="/images/LandingPage/hero-title.png"
            alt="Spell Play Learn"
            width={594}
            height={292}
            className="w-56 md:w-64 lg:w-80 xl:w-[360px] h-auto drop-shadow-md"
            priority
            quality={100}
            sizes="(max-width: 1024px) 16rem, (max-width: 1280px) 20rem, 360px"
          />
          <Link href="/sign-in" className="hover:opacity-90 active:scale-95 transition-all">
            <Image
              src="/images/LandingPage/login-to-start-button.svg"
              alt="Login to Start"
              width={256}
              height={64}
              className="w-44 md:w-48 lg:w-56 xl:w-60 h-auto"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
