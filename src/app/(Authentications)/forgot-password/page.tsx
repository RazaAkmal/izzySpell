import React from "react";
import ResetPassword from "./ResetPassword";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-login-background p-4">
      <div className="bg-lightBlue flex flex-col items-center rounded-3xl shadow-lg p-10 max-w-screen-md w-full z-10">
        <h1 className="text-4xl mb-5 font-bold text-center text-gray-700">
          IzzySpell
        </h1>
        <p className="text-center text-blue font-bold text-3xl mb-6">
          Set New Password
        </p>
        <ResetPassword />
        <p className="mt-4 text-center text-purple text-sm">
          Don’t have an account yet?{" "}
          <Link
            href="/signup"
            className="font-bold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
