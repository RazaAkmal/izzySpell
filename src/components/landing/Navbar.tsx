"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Get Started", href: "#get-started" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-4 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <Image
        src="/images/LandingPage/logo.png"
        alt="IzzySpell"
        width={120}
        height={40}
        className="h-10 w-auto object-contain"
        priority
      />

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-8 text-[#1a3a6b] font-medium text-sm">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="hover:text-blue transition-colors">
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="hidden md:inline-block text-[#1a3a6b] font-semibold text-sm hover:text-blue transition-colors px-4 py-2.5"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-blue text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-darkBlue transition-colors shadow-md"
        >
          Sign Up
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-[#1a3a6b] transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#1a3a6b] transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#1a3a6b] transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-8 flex flex-col gap-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#1a3a6b] font-medium text-sm hover:text-blue transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <Link href="/sign-in" className="text-[#1a3a6b] font-semibold text-sm hover:text-blue transition-colors py-1" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
            <Link href="/signup" className="bg-blue text-white px-6 py-2.5 rounded-full font-semibold text-sm text-center hover:bg-darkBlue transition-colors" onClick={() => setMenuOpen(false)}>
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
