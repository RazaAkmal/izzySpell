import React from "react";
import LoginForm from "./LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-login-background bg-cover bg-center">
      <div className="bg-lightBlue flex flex-col items-center rounded-3xl shadow-lg p-10 max-w-screen-md w-full z-10">
        <h1 className="text-4xl mb-5 font-bold text-center text-gray-700">
          IzzySpell
        </h1>
        <p className="text-center text-blue font-bold text-3xl mb-6">
          Welcome Back
        </p>
        <LoginForm />
        <p className="mt-4 text-center text-blue text-sm">
          Don’t have an account yet?{" "}
          <Link href="#" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
