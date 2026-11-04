import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#4FB4FE] lg:h-svh lg:min-h-[680px]">
      {/*
        Background sky. The bottom ~30% of hero-bg.svg is a solid yellow band,
        so the image box is made taller than the section (1881 / 1320 ≈ 143%)
        and anchored to the top — only the sky is ever visible, at any aspect ratio.
      */}
      <div className="absolute inset-x-0 top-0 h-[143%]" aria-hidden="true">
        <Image
          src="/images/LandingPage/hero-bg.svg"
          alt=""
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
        />
      </div>

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
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-[#4793FE] px-4 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#3578d6] active:scale-95 sm:px-6"
            >
              Sign Up Free
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border-2 border-white px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20 active:scale-95 sm:px-6"
            >
              Login
            </Link>
          </div>
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
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-[#4793FE] px-8 py-3 text-base font-bold text-white shadow-md transition hover:bg-[#3578d6] active:scale-95 lg:px-10 lg:text-lg"
            >
              Sign Up Free
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border-2 border-white px-7 py-2.5 text-base font-bold text-white transition hover:bg-white/20 active:scale-95 lg:px-9 lg:text-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
