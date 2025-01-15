/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { loginFormValues } from "@/lib/defination";
import { useActionState } from "react";
import { authenticate } from "@/app/actions/authenticate";

const LoginForm = () => {
  const {
    register,
    formState: { errors },
  } = useForm<loginFormValues>();
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form
      action={formAction}
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
        <CustomButton
          disabled={isPending}
          type="submit"
          label="Log in"
          fullWidth
        />
      </div>
      {errorMessage && (
        <>
          <p className="text-sm text-red-500">{errorMessage}</p>
        </>
      )}
    </form>
  );
};

export default LoginForm;
