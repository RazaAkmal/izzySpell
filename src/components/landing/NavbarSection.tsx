"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[calc(100%-5rem)] md:w-[calc(100%-7rem)] -translate-x-1/2 sm:top-6">
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
          <Link href="#">
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
          <Link href="#trust">
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
          className="flex flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle navigation"
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
        <div className="mt-2 flex flex-col items-start gap-4 rounded-2xl bg-skyBlue p-5 shadow-lg md:hidden">
          <Link href="#" onClick={() => setMenuOpen(false)}>
            <Image
              src="/images/LandingPage/about-us.svg"
              alt="About Us"
              width={80}
              height={24}
              className="w-auto h-6 object-contain"
            />
          </Link>
          <Link href="#why-choose" onClick={() => setMenuOpen(false)}>
            <Image
              src="/images/LandingPage/features.svg"
              alt="Features"
              width={80}
              height={24}
              className="w-auto h-6 object-contain"
            />
          </Link>
          <Link href="#how-it-works" onClick={() => setMenuOpen(false)}>
            <Image
              src="/images/LandingPage/play-games.svg"
              alt="Play Games"
              width={96}
              height={24}
              className="w-auto h-6 object-contain"
            />
          </Link>
          <Link href="#trust" onClick={() => setMenuOpen(false)}>
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
            className="rounded-full bg-[#4793FE] px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#3578d6] active:scale-95"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
