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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submitForm = async (data: SignupFormValues) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
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

      const result = await response.json();
      setSuccessMessage(`${result.message} Redirecting to login...`);
      setTimeout(() => router.push(`/sign-in`), 2500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Password reset failed");
      setLoading(false);
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
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      {successMessage && <p className="text-green mt-2 text-center">{successMessage}</p>}
      <div className="w-full max-w-md px-4">
        <CustomButton type="submit" label="Reset Password" fullWidth loading={loading} />
      </div>
    </form>
  );
};

export default ResetPassword;
