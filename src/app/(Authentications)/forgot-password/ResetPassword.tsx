"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import { SignupFormValues } from "@/lib/defination";
import React from "react";
import { useForm } from "react-hook-form";

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>();

  const submitForm = async (data: SignupFormValues) => {
    try {
      const response = await fetch('/api/auth/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: data.name, password: data.password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password reset failed');
      }
  
      const result = await response.json();
      alert(result.message); // Show success message
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
