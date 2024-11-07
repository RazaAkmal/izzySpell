import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import Link from "next/link";
import React from "react";

const LoginForm = () => {
  return (
    <form className="space-y-4 w-full flex flex-col items-center">
      <InputField type="text" placeholder="User Name" />
      <InputField type="password" placeholder="Password" />
      <div className="w-full max-w-sm text-right text-darkBlue text-sm">
        <Link href="/forgot-password" className="hover:underline">
          Forgot Password?
        </Link>
      </div>
      <div className="w-full max-w-md px-4">
        <CustomButton label="Log in" fullWidth />
      </div>
    </form>
  );
};

export default LoginForm;
