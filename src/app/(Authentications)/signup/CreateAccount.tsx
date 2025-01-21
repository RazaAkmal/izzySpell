"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import { SignupFormValues } from "@/lib/defination";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import SuccessSignUpModal from "./SuccessSignUpModal";

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormValues>();
  const router = useRouter();
  const password = watch("password"); // Watch the password field
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [data, setData] = useState<{ name: string } | null>(null);

  const submitForm = async (data: SignupFormValues) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          password: data.password,
        }),
      });

      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }
      setLoading(false);
      setSuccessModal(true);
      const user = await response.json();
      setData(user);
    } catch (error: any) {
      setLoading(false);
      setErrorMessage(error.message);
    }
  };
  const handleNavigate = () => {
    if (data?.name) {
      router.push(`/sign-in?userName=${data.name}`);
      setSuccessModal(false);
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
        rules={{
          minLength: {
            value: 4,
            message: "Username must be at least 4 characters",
          },
          pattern: {
            value: /^[A-Za-z0-9]+$/,
            message: "Username must contain only letters and numbers",
          },
          validate: {
            notOnlyNumbers: (value: string) =>
              /[a-zA-Z]/.test(value) || "Username cannot be all numbers",
          },
        }}
      />
      <InputField
        id="password"
        register={register}
        errors={errors}
        fieldName="password"
        type="password"
        requiredValue={true}
        placeholder="Password"
        rules={{
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        }}
      />
      <InputField
        id="confirmPassword"
        register={register}
        errors={errors}
        fieldName="confirmPassword"
        type="password"
        requiredValue={true}
        placeholder="Confirm Password"
        rules={{
          validate: (value: any) =>
            value === password || "Passwords do not match",
        }}
      />
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      <div className="w-full max-w-md px-4">
        <CustomButton
          disabled={loading}
          type="submit"
          label="Signup"
          fullWidth
        />
      </div>
      <SuccessSignUpModal
        isOpen={successModal}
        handleNavigate={handleNavigate}
      />
    </form>
  );
};

export default SignupForm;
