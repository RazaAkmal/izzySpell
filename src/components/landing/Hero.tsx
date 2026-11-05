import Image from "next/image";
import Link from "next/link";

const ctaFocusClass =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white";

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
          sizes="100vw"
        />
      </div>

      {/* Mobile & tablet: stacked layout, content drives the height */}
      <div className="relative flex flex-col items-center px-5 pb-12 pt-24 sm:px-8 sm:pt-28 lg:hidden">
        <Image
          src="/images/LandingPage/hero-img.png"
          alt="A child using IzzySpell on a tablet with friendly letter characters"
          width={1728}
          height={1622}
          className="h-auto w-full max-w-[560px]"
          quality={100}
          sizes="(max-width: 640px) 100vw, 560px"
        />
        <div className="mt-4 flex flex-col items-center gap-4 text-center">
          <h1>
            <Image
              src="/images/LandingPage/hero-title.png"
              alt="Spell Play Learn"
              width={594}
              height={292}
              className="h-auto w-48 drop-shadow-md sm:w-64"
              quality={100}
              sizes="(max-width: 640px) 12rem, 16rem"
            />
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/signup"
              className={`rounded-full bg-[#4793FE] px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-[#3578d6] active:scale-95 sm:px-7 sm:text-base ${ctaFocusClass}`}
            >
              Sign Up Free
            </Link>
            <Link
              href="/sign-in"
              className={`rounded-full border-2 border-white px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 active:scale-95 sm:px-7 sm:text-base ${ctaFocusClass}`}
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop: text on the left, illustration anchored bottom-right */}
      <div className="absolute inset-0 mx-auto hidden w-full max-w-[1400px] lg:block 2xl:max-w-[1680px]">
        {/*
          Sized by height (section minus navbar clearance) so the illustration
          never runs under the fixed navbar on short, wide laptop screens;
          max-w keeps it clear of the title on narrower ones.
        */}
        <div
          className="pointer-events-none absolute bottom-0 right-[-3%] h-[calc(100%-8rem)] max-w-[60%]"
          style={{ aspectRatio: "1728 / 1622" }}
        >
          <Image
            src="/images/LandingPage/hero-img.png"
            alt="A child using IzzySpell on a tablet with friendly letter characters"
            fill
            className="object-contain object-bottom"
            priority
            quality={100}
            sizes="(max-width: 1440px) 60vw, 900px"
          />
        </div>

        <div className="absolute inset-y-0 left-[6%] flex flex-col items-start justify-center gap-5 pt-16">
          <h1>
            <Image
              src="/images/LandingPage/hero-title.png"
              alt="Spell Play Learn"
              width={594}
              height={292}
              className="h-auto w-72 drop-shadow-md xl:w-[360px] 2xl:w-[440px]"
              quality={100}
              sizes="(max-width: 1280px) 18rem, (max-width: 1536px) 360px, 440px"
            />
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className={`rounded-full bg-[#4793FE] px-8 py-3 text-base font-bold text-white shadow-md transition hover:bg-[#3578d6] active:scale-95 xl:px-10 xl:text-lg 2xl:px-12 2xl:py-4 2xl:text-xl ${ctaFocusClass}`}
            >
              Sign Up Free
            </Link>
            <Link
              href="/sign-in"
              className={`rounded-full border-2 border-white px-7 py-2.5 text-base font-bold text-white transition hover:bg-white/20 active:scale-95 xl:px-9 xl:text-lg 2xl:px-11 2xl:py-3.5 2xl:text-xl ${ctaFocusClass}`}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
