import InputField from "@/components/Input";
import React from "react";

const LoginForm = () => {
  return (
    <form className="space-y-4 w-full flex flex-col items-center">
      <InputField type="email" placeholder="Email" />
      <InputField type="password" placeholder="Password" />
      <div className="w-full max-w-sm text-right text-blue text-sm">
        <a href="#" className="hover:underline">
          Forgot Password?
        </a>
      </div>
      <div className="w-full max-w-md px-4">
        <button
          type="submit"
          className="w-full bg-blue text-white py-2 rounded-xl hover:bg-blue-600"
        >
          Log in
        </button>
      </div>
      <div className="w-full max-w-md px-4">
        <button
          type="button"
          className="w-full border border-blue text-blue py-2 rounded-xl hover:bg-blue hover:text-white"
        >
          Sign in with Google
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
