import React from "react";
import Image from "next/image"; // Import Image from next/image
import LoginForm from "./LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-login-background bg-cover bg-center p-4">
      <div className="bg-lightBlue flex flex-col items-center rounded-3xl shadow-lg p-10 max-w-screen-md w-full z-10">
        <div className="relative flex items-center h-20 w-72">
          <Image
            src="/images/izzyLogo.svg"
            alt="Logo"
            width={300}
            height={40}
            className="mx-auto"
          />
        </div>
        <div className="relative flex items-center h-20 w-72">
          <Image
            src="/images/titles/LoginTitle.svg"
            alt="User avatar"
            width={250}
            height={40}
            className="mx-auto"
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
