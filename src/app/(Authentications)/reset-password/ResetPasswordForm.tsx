"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import { ResetPasswordFormValues } from "@/lib/defination";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import PasswordToggleButton from "@/components/PasswordToggleButton";
import { AUTH_MESSAGES, passwordSchema, zodFieldRule } from "@/lib/authValidation";

// Step 2 of resetting a password: choose a new one using the token from the email link.

const ResetPasswordForm = ({ token }: { token: string }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormValues>();
  const password = watch("password");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submitForm = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    setErrorMessage(null);
    setLinkInvalid(false);
    try {
      const response = await fetch("/api/auth/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.error === AUTH_MESSAGES.resetLinkInvalid) setLinkInvalid(true);
        throw new Error(result.error || "Password reset failed");
      }
      setSuccessMessage(`${result.message} Redirecting to login...`);
      setTimeout(() => router.push(`/sign-in`), 2500);
    } catch (error) {
      setErrorMessage(
        error instanceof TypeError
          ? "Couldn't reach the server. Please check your connection and try again."
          : error instanceof Error
          ? error.message
          : "Password reset failed"
      );
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-4 w-full flex flex-col items-center"
    >
      <div className="relative w-full max-w-md">
        <InputField
          id="password"
          register={register}
          errors={errors}
          fieldName="password"
          type={showPassword ? "text" : "password"}
          requiredValue={true}
          placeholder="New Password"
          className="pr-10"
          rules={{
            // Same rules as the server (src/lib/authValidation.ts)
            validate: zodFieldRule(passwordSchema),
          }}
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
          placeholder="Confirm New Password"
          className="pr-10"
          rules={{
            validate: (value: string) =>
              value === password || AUTH_MESSAGES.passwordsDoNotMatch,
          }}
        />
        <PasswordToggleButton show={showConfirmPassword} onClick={() => setShowConfirmPassword((v) => !v)} />
      </div>
      {errorMessage && (
        <p className="text-red-500 mt-2 text-center">
          {errorMessage}
          {linkInvalid && (
            <>
              {" "}
              <Link href="/forgot-password" className="font-bold underline">
                Request a new link
              </Link>
            </>
          )}
        </p>
      )}
      {successMessage && <p className="text-green mt-2 text-center">{successMessage}</p>}
      <div className="w-full max-w-md px-4">
        <CustomButton type="submit" label="Reset Password" fullWidth loading={loading} disabled={!!successMessage} />
      </div>
    </form>
  );
};

export default ResetPasswordForm;
