import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import React from "react";

const ResetPassword = () => {
  return (
    <form className="space-y-4 w-full flex flex-col items-center">
      <InputField type="text" placeholder="User Name" />
      <InputField type="password" placeholder="Password" />
      <InputField type="password" placeholder="Confirm Password" />
      <div className="w-full max-w-md px-4">
        <CustomButton label="Signup" fullWidth />
      </div>
    </form>
  );
};

export default ResetPassword;
