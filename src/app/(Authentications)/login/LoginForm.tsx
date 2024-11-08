"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { loginFormValues } from "@/lib/defination";


const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginFormValues>();
  const router = useRouter();

  const submitForm = async (data: loginFormValues) => {
    const {name, password} = data;
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, password }),
    });
  
    const user = await response.json();
  
    if (response.ok) {
      if (!user.profileUpdated) {
        router.push(`profile/${user.id}`)
      } else {
        router.push("/dashboard")
      }
      console.log('Login successful:', data);
    } else {
      console.error('Login failed:');
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
