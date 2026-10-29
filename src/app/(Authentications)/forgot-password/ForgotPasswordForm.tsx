"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import { ForgotPasswordFormValues } from "@/lib/defination";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

// Step 1 of resetting a password: ask for the username, then email a reset link to the
// parent email on file. The server answers the same way for every username.

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submitForm = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/auth/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.name }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Something went wrong. Please try again.");
      }
      setSuccessMessage(result.message);
    } catch (error) {
      setErrorMessage(
        error instanceof TypeError
          ? "Couldn't reach the server. Please check your connection and try again."
          : error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
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
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      {successMessage && (
        <div className="w-full max-w-md text-center space-y-2">
          <p className="text-green mt-2">{successMessage}</p>
          {SUPPORT_EMAIL && (
            <p className="text-sm text-darkBlue">
              No parent email on the account? Contact support at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
          )}
        </div>
      )}
      <div className="w-full max-w-md px-4">
        <CustomButton type="submit" label="Send reset link" fullWidth loading={loading} />
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
