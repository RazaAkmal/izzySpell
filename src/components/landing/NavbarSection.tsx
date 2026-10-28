"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[calc(100%_-_2rem)] max-w-[1320px] -translate-x-1/2 sm:top-6 sm:w-[calc(100%_-_3rem)] md:w-[calc(100%_-_7rem)]">
      <nav className="flex items-center justify-between rounded-2xl bg-skyBlue px-4 py-3 shadow-md sm:px-8 sm:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="relative flex h-12 w-36 shrink-0 items-center sm:h-14 sm:w-48"
        >
          <Image
            src="/images/LandingPage/logo.png"
            alt="IzzySpell Logo"
            fill
            className="object-contain"
            priority
            quality={100}
            sizes="(max-width: 640px) 9rem, 12rem"
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="#see-app-actions">
            <Image
              src="/images/LandingPage/about-us.svg"
              alt="About Us"
              width={80}
              height={24}
              className="w-20 h-auto"
              priority
            />
          </Link>
          <Link href="#why-choose">
            <Image
              src="/images/LandingPage/features.svg"
              alt="Features"
              width={80}
              height={24}
              className="w-20 h-auto"
              priority
            />
          </Link>
          <Link href="#how-it-works">
            <Image
              src="/images/LandingPage/play-games.svg"
              alt="Play Games"
              width={96}
              height={24}
              className="w-24 h-auto"
              priority
            />
          </Link>
          <Link href="#contact">
            <Image
              src="/images/LandingPage/contact-us.svg"
              alt="Contact Us"
              width={96}
              height={24}
              className="w-24 h-auto"
              priority
            />
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full bg-[#4793FE] px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#3578d6] active:scale-95"
          >
            Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span
            className={`block h-0.5 w-6 rounded bg-[#426096] transition-all ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 rounded bg-[#426096] transition-all ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 rounded bg-[#426096] transition-all ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="mt-2 flex flex-col items-start gap-1 rounded-2xl bg-skyBlue p-3 shadow-lg md:hidden">
          <Link href="#see-app-actions" onClick={() => setMenuOpen(false)} className="w-full rounded-xl px-2 py-2.5">
            <Image
              src="/images/LandingPage/about-us.svg"
              alt="About Us"
              width={80}
              height={24}
              className="w-auto h-6 object-contain"
            />
          </Link>
          <Link href="#why-choose" onClick={() => setMenuOpen(false)} className="w-full rounded-xl px-2 py-2.5">
            <Image
              src="/images/LandingPage/features.svg"
              alt="Features"
              width={80}
              height={24}
              className="w-auto h-6 object-contain"
            />
          </Link>
          <Link href="#how-it-works" onClick={() => setMenuOpen(false)} className="w-full rounded-xl px-2 py-2.5">
            <Image
              src="/images/LandingPage/play-games.svg"
              alt="Play Games"
              width={96}
              height={24}
              className="w-auto h-6 object-contain"
            />
          </Link>
          <Link href="#contact" onClick={() => setMenuOpen(false)} className="w-full rounded-xl px-2 py-2.5">
            <Image
              src="/images/LandingPage/contact-us.svg"
              alt="Contact Us"
              width={96}
              height={24}
              className="w-auto h-6 object-contain"
            />
          </Link>
          <Link
            href="/sign-in"
            className="mt-2 w-full rounded-full bg-[#4793FE] px-6 py-3 text-center text-sm font-bold text-white shadow transition hover:bg-[#3578d6] active:scale-95"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
