import React from "react";
import Image from "next/image";
import Link from "next/link";
import DraftBanner from "./DraftBanner";
import { CONSENT_VERSION } from "@/lib/consent";

// Shared layout for /terms and /privacy: same look as the sign-in pages
// (background, logo, rounded light card), readable on phones.
export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-center min-h-screen bg-login-background bg-cover bg-center p-3 sm:p-6">
      <div className="bg-lightBlue rounded-3xl shadow-lg p-5 sm:p-10 max-w-screen-md w-full my-4 z-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link href="/" className="text-purple font-bold hover:underline text-sm sm:text-base">
            &larr; Back
          </Link>
          <Link href="/" className="relative flex items-center h-12 w-40 sm:w-52 overflow-hidden">
            <Image src="/images/izzyLogo.svg" alt="IzzySpell" width={208} height={48} className="mx-auto" />
          </Link>
        </div>
        <DraftBanner />
        <h1 className="text-center text-blue font-bold text-2xl sm:text-3xl mb-1">{title}</h1>
        {/* Same version string that is stored with each account's consent */}
        <p className="text-center text-sm text-darkBlue mb-6">Last updated: {CONSENT_VERSION}</p>
        <div className="space-y-5 text-darkBlue text-sm sm:text-base leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// A fact that must be filled in before publishing; rendered highlighted on purpose
export function Placeholder({ children }: { children: React.ReactNode }) {
  return <mark className="bg-yellow-200 text-darkGray rounded px-1 font-semibold">{children}</mark>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg sm:text-xl font-bold text-purple mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
