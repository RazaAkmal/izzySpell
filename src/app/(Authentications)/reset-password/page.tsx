import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ResetPasswordForm from "./ResetPasswordForm";

// The URL carries a one-time reset token: keep it out of search engines and out of
// the Referer header sent to other sites.
export const metadata: Metadata = {
  title: "Set a new password - IzzySpell",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const raw = (await searchParams).token;
  const token = typeof raw === "string" ? raw : "";

  return (
    <div className="flex items-center justify-center min-h-screen bg-login-background bg-cover bg-center p-4">
      <div className="bg-lightBlue flex flex-col items-center rounded-3xl shadow-lg p-10 max-w-screen-md w-full z-10">
        <div className="relative flex items-center h-20 w-72 overflow-hidden">
          <Image
            src="/images/izzyLogo.svg"
            alt="Logo"
            width={300}
            height={40}
            className="mx-auto"
          />
        </div>
        <p className="text-center text-blue font-bold text-3xl mb-6">
          Set New Password
        </p>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-center text-darkBlue">
            This reset link is missing its code. Please{" "}
            <Link href="/forgot-password" className="font-bold underline">
              request a new reset link
            </Link>
            .
          </p>
        )}
        <p className="mt-4 text-center text-purple text-sm">
          Remembered it?{" "}
          <Link href="/sign-in" className="font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
