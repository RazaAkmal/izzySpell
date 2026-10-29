import Image from "next/image";

const NAV_LINKS = [
  {
    label: "About Us",
    img: "/images/LandingPage/about-us.svg",
    href: "#see-app-actions",
  },
  {
    label: "Features",
    img: "/images/LandingPage/features.svg",
    href: "#why-choose",
  },
  {
    label: "Privacy Policy",
    img: "/images/LandingPage/privacy-policy.svg",
    href: "/privacy",
  },
  {
    label: "Terms of Service",
    href: "/terms",
  },
  {
    label: "Play Games",
    img: "/images/LandingPage/play-games.svg",
    href: "#how-it-works",
  },
  {
    label: "Contact Us",
    img: "/images/LandingPage/contact-us.svg",
    href: "#contact",
  },
];

const SOCIAL = [
  {
    label: "Facebook",
    href: "#",
    icon: "/images/LandingPage/fb.svg",
  },
  {
    label: "X (Twitter)",
    href: "#",
    icon: "/images/LandingPage/x.svg",
  },
  {
    label: "YouTube",
    href: "#",
    icon: "/images/LandingPage/yt.png",
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative w-full bg-[#F9F9F9] overflow-hidden pt-10 pb-28 px-6 sm:pb-16 md:py-12">
      {/* Left decorative mountains */}
      <div className="absolute left-0 bottom-0 w-[90px] sm:w-[140px] md:w-[180px] xl:w-[260px] pointer-events-none select-none" aria-hidden="true">
        <Image
          src="/images/LandingPage/footer-img-1.svg"
          alt=""
          width={220}
          height={180}
          className="object-contain w-full h-auto"
        />
      </div>

      {/* Right decorative heart/cloud */}
      <div className="absolute right-0 bottom-0 w-[80px] sm:w-[120px] md:w-[150px] xl:w-[210px] pointer-events-none select-none" aria-hidden="true">
        <Image
          src="/images/LandingPage/footer-img-2.svg"
          alt=""
          width={200}
          height={180}
          className="object-contain w-full h-auto"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo */}
        <Image
          src="/images/LandingPage/logo.png"
          alt="IzzySpell"
          width={1003}
          height={410}
          className="object-contain w-[140px] h-auto"
          quality={100}
          sizes="140px"
        />

        {/* Tagline */}
        <p className="text-[#3AB0FA] font-bold text-base sm:text-xl text-center max-w-lg">
          Making learning fun, safe, and engaging for every child.
        </p>

        {/* Nav links */}
        <nav aria-label="Footer" className="flex max-w-xs flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:max-w-none sm:gap-x-6">
          {NAV_LINKS.map((link) =>
            link.img ? (
              <a
                key={link.label}
                href={link.href}
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src={link.img}
                  alt={link.label}
                  width={120}
                  height={28}
                  className="w-auto h-5 sm:h-6 object-contain"
                />
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-[#3B82F6] font-bold text-sm sm:text-base hover:opacity-80 transition-opacity"
                style={{ fontFamily: "inherit" }}
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        {/* Social icons */}
        <div className="flex items-center">
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:-translate-y-0.5"
            >
              <Image
                src={s.icon}
                alt=""
                width={100}
                height={100}
                className="object-contain w-10 h-10"
                quality={100}
                sizes="40px"
              />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-[#0656A3] text-xs sm:text-sm text-center font-semibold">
          © {new Date().getFullYear()} Izzyspell. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
