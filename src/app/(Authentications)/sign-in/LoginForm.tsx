/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import PasswordToggleButton from "@/components/PasswordToggleButton";
import Link from "next/link";
import { loginFormValues } from "@/lib/defination";
import { authenticate } from "@/app/actions/authenticate";
import { useSearchParams } from "next/navigation";

const LoginForm = () => {
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName") || "";
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<loginFormValues>({
    defaultValues: { name: userName },
  });
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit: SubmitHandler<loginFormValues> = async (data) => {
    setErrorMessage('')
    setIsPending(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("password", data.password);
    const result = await authenticate(userName, formData);
    if (result) {
      setErrorMessage(result);
    }
    setIsPending(false);
  };

  const name = watch("name");
  const password = watch("password");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
      <div className="relative w-full max-w-md">
        <InputField
          id="password"
          register={register}
          errors={errors}
          fieldName="password"
          requiredValue={true}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="pr-10"
        />
        <PasswordToggleButton show={showPassword} onClick={() => setShowPassword((v) => !v)} />
      </div>
      <div className="w-full max-w-sm text-right text-darkBlue text-sm">
        <Link href="/forgot-password" className="hover:underline">
          Forgot Password?
        </Link>
      </div>
      <div className="w-full max-w-md px-4">
        <CustomButton
          disabled={!name || !password}
          loading={isPending}
          type="submit"
          label="Log in"
          fullWidth
        />
      </div>
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </form>
  );
};

export default LoginForm;
