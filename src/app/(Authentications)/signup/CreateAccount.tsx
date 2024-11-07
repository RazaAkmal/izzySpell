"use client";
import { signupUser } from "@/app/api/auth/route";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

type SignupFormValues = {
  name: string;
  password: string;
  confirmPassword: string;
};
const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>();
  const router = useRouter();

  const submitForm = async (data: SignupFormValues) => {
    try {
      const user = await signupUser(data.name, data.password);
      router.push(`/profile/${user.id}`);
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
        <CustomButton type="submit" label="Signup" fullWidth />
      </div>
    </form>
  );
};

export default SignupForm;
