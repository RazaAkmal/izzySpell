import React from "react";
import Image from "next/image"; // Import Image from next/image
import LoginForm from "./LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-login-background bg-cover bg-center p-4">
      <div className="bg-lightBlue flex flex-col items-center rounded-3xl shadow-lg p-10 max-w-screen-md w-full z-10">
        <h1 className="text-4xl font-bold text-center text-gray-700">
          IzzySpell
        </h1>
        <div className="flex justify-center mb-6">
          <Image
            src="/images/titles/LoginTitle.svg"
            alt="User avatar"
            width={40}
            height={40}
            className="w-80"
          />
        </div>
        <LoginForm />
        <p className="mt-4 text-center text-purple text-md">
          Don’t have an account yet?{" "}
          <Link href="/signup" className="font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
