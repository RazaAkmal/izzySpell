"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import { SignupFormValues } from "@/lib/defination";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import SuccessSignUpModal from "./SuccessSignUpModal";
import PasswordToggleButton from "@/components/PasswordToggleButton";
import ConsentCheckbox from "@/components/ConsentCheckbox";
import { authenticate } from "@/app/actions/authenticate";
import {
  AUTH_MESSAGES,
  emailSchema,
  normalizeEmail,
  passwordSchema,
  usernameSchema,
  zodFieldRule,
} from "@/lib/authValidation";

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormValues>();
  const router = useRouter();
  const password = watch("password"); // Watch the password field
  const parentEmail = watch("parentEmail");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [data, setData] = useState<{ name: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          parentEmail: data.parentEmail,
          confirmParentEmail: data.confirmParentEmail,
          password: data.password,
          confirmPassword: data.confirmPassword,
          acceptedTerms: data.acceptedTerms === true,
        }),
      });

      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Signup failed. Please try again.");
      }
      const user = await response.json();
      setData(user);

      // Sign the new user in straight away and send them to profile setup.
      // On success the server action redirects; if it fails, fall back to
      // the success modal so the user can log in manually.
      const formData = new FormData();
      // Use the name as stored by the server (trimmed)
      formData.append("name", user.name ?? data.name);
      formData.append("password", data.password);
      formData.append("redirectTo", `/profile/${user.id}`);
      const signInError = await authenticate(undefined, formData).catch(
        () => "Automatic sign-in failed"
      );
      if (signInError) {
        setLoading(false);
        setSuccessModal(true);
      }
    } catch (error: any) {
      setLoading(false);
      // fetch throws a TypeError when the server can't be reached
      setErrorMessage(
        error instanceof TypeError
          ? "Couldn't reach the server. Please check your connection and try again."
          : error.message
      );
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
          // Same rules as the server (src/lib/authValidation.ts)
          validate: zodFieldRule(usernameSchema),
        }}
      />
      <InputField
        id="parentEmail"
        register={register}
        errors={errors}
        fieldName="parentEmail"
        type="text"
        requiredValue={true}
        placeholder="Parent Email"
        rules={{
          // Same rules as the server (src/lib/authValidation.ts)
          validate: zodFieldRule(emailSchema),
        }}
      />
      <InputField
        id="confirmParentEmail"
        register={register}
        errors={errors}
        fieldName="confirmParentEmail"
        type="text"
        requiredValue={true}
        placeholder="Confirm Parent Email"
        rules={{
          validate: (value: any) =>
            normalizeEmail(value) === normalizeEmail(parentEmail) || AUTH_MESSAGES.parentEmailsDoNotMatch,
        }}
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
          rules={{
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
          placeholder="Confirm Password"
          className="pr-10"
          rules={{
            validate: (value: any) =>
              value === password || AUTH_MESSAGES.passwordsDoNotMatch,
          }}
        />
        <PasswordToggleButton show={showConfirmPassword} onClick={() => setShowConfirmPassword((v) => !v)} />
      </div>
      <ConsentCheckbox
        registration={register("acceptedTerms", {
          shouldUnregister: true,
          validate: (value: boolean) => value === true || AUTH_MESSAGES.termsRequired,
        })}
        error={errors.acceptedTerms?.message}
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
