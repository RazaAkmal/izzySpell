import Image from "next/image";

const NAV_LINKS = [
  {
    label: "About Us",
    img: "/images/LandingPage/about-us.svg",
    href: "#about",
  },
  {
    label: "Features",
    img: "/images/LandingPage/features.svg",
    href: "#features",
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
    href: "#games",
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
    <footer className="relative w-full bg-[#F9F9F9] overflow-hidden py-10 px-6">
      {/* Left decorative mountains */}
      <div className="absolute left-0 bottom-0 w-[120px] sm:w-[220px] md:w-[450px] pointer-events-none select-none">
        <Image
          src="/images/LandingPage/footer-img-1.svg"
          alt=""
          width={220}
          height={180}
          className="object-contain w-full h-auto"
        />
      </div>

      {/* Right decorative heart/cloud */}
      <div className="absolute right-0 bottom-24 md:bottom-0 w-[120px] sm:w-[180px] md:w-[350px] pointer-events-none select-none">
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
        <nav className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-x-4 gap-y-4 sm:gap-x-6">
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
                  className="w-auto h-7 object-contain"
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
              className={`w-16 h-16 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}
            >
              <Image
                src={s.icon}
                alt={s.label}
                width={100}
                height={100}
                className="object-contain w-16 h-16"
                quality={100}
                sizes="64px"
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
