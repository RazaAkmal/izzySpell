"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import { SignupFormValues } from "@/lib/defination";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import PasswordToggleButton from "@/components/PasswordToggleButton";

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submitForm = async (data: SignupFormValues) => {
    try {
      const response = await fetch("/api/auth/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.name, password: data.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Password reset failed");
      }

      router.push(`/sign-in`);
    } catch (error) {
      alert(error);
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
      <div className="relative w-full max-w-md">
        <InputField
          id="password"
          register={register}
          errors={errors}
          fieldName="password"
          type={showPassword ? "text" : "password"}
          requiredValue={true}
          placeholder="Password"
          className="pr-10"
        />
        <PasswordToggleButton show={showPassword} onClick={() => setShowPassword((v) => !v)} />
      </div>
      <div className="relative w-full max-w-md">
        <InputField
          id="confirmPassword"
          register={register}
          errors={errors}
          fieldName="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          requiredValue={true}
          placeholder="Confirm Password"
          className="pr-10"
        />
        <PasswordToggleButton show={showConfirmPassword} onClick={() => setShowConfirmPassword((v) => !v)} />
      </div>
      <div className="w-full max-w-md px-4">
        <CustomButton type="submit" label="Reset Password" fullWidth />
      </div>
    </form>
  );
};

export default ResetPassword;
