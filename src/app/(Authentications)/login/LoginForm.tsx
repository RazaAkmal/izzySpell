"use client";
import { loginUser } from "@/app/api/auth/route";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type loginFormValues = {
  name: string;
  password: string;
};

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginFormValues>();
  const router = useRouter();

  const submitForm = async (data: loginFormValues) => {
    try {
      const user = await loginUser(data.name, data.password);

      if (user.profileUpdated) {
        router.push("/profile/home");
      } else {
        router.push(`/profile/${user.id}`);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-4 w-full flex flex-col items-center"
    >
      <InputField
        id="name"
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
        requiredValue={true}
        type="password"
        placeholder="Password"
      />
      <div className="w-full max-w-sm text-right text-darkBlue text-sm">
        <Link href="/forgot-password" className="hover:underline">
          Forgot Password?
        </Link>
      </div>
      <div className="w-full max-w-md px-4">
        <CustomButton type="submit" label="Log in" fullWidth />
      </div>
    </form>
  );
};

export default LoginForm;
