import React from "react";
import SignupForm from "./CreateAccount";
import Link from "next/link";
import Image from "next/image";
export default function LoginPage() {
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
        <div className="relative flex items-center h-20 w-72 overflow-hidden">
          <Image
            src="/images/titles/SignupTitle.svg"
            alt="signup title"
            width={300}
            height={40}
            className="mx-auto"
          />
        </div>
        <SignupForm />
        <p className="mt-4 text-center text-purple text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
