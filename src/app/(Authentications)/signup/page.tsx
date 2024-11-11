import React from "react";
import SignupForm from "./CreateAccount";
import Link from "next/link";
import Image from 'next/image';
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-login-background p-4">
      <div className="bg-lightBlue flex flex-col items-center rounded-3xl shadow-lg p-10 max-w-screen-md w-full z-10">
        <h1 className="text-4xl font-bold text-center text-gray-700">
          IzzySpell
        </h1>
        <div className="flex justify-center mb-6">
          <Image
            src="/images/titles/SignupTitle.svg"
            alt="User avatar"
            width={40}
            height={40}
            className="w-80"
          />
        </div>
        <SignupForm />
        <p className="mt-4 text-center text-purple text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
