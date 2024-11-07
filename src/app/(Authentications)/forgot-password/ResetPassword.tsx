"use client";
import { resetPassword } from "@/app/api/auth/route";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import React from "react";
import { useForm } from "react-hook-form";

type SignupFormValues = {
  name: string;
  password: string;
  confirmPassword: string;
};
const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>();

  const submitForm = async (data: SignupFormValues) => {
    try {
      const response = await resetPassword(data.name, data.password);
      console.log(response);
      // alert(response.message);
    } catch (error) {
      // alert(error?.message);
      console.log(error);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-4 w-full flex flex-col items-center"
    >
      <InputField
        id="userName"
        register={register}
        errors={errors}
        fieldName="name"
        type="text"
        requiredValue={true}
        placeholder="User Name"
      />
      <InputField
        id="password"
        register={register}
        errors={errors}
        fieldName="password"
        type="password"
        requiredValue={true}
        placeholder="Password"
      />
      <InputField
        id="confirmPassword"
        register={register}
        errors={errors}
        fieldName="confirmPassword"
        type="password"
        requiredValue={true}
        placeholder="Confirm Password"
      />
      <div className="w-full max-w-md px-4">
        <CustomButton type="submit" label="Reset Password" fullWidth />
      </div>
    </form>
  );
};

export default ResetPassword;
