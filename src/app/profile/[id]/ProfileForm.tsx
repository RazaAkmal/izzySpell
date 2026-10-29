"use client";
import InputField from "@/components/Input";
import React, { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import Image from "next/image";
import { Radio, RadioGroup } from "@headlessui/react";
import { ProfileFormValues } from "@/lib/defination";
import AgeGradeSelectionButton from "@/components/AgeGradeSelectionButton";
import CustomButton from "@/components/HeadlessButton";
import { supabase } from "@/app/utils/supabaseClient";
import { v4 as uuidv4 } from 'uuid';
import { AGE_OPTIONS, GRADE_OPTIONS, firstNameSchema, lastNameSchema } from "@/lib/profileValidation";
import { AUTH_MESSAGES, emailSchema, normalizeEmail, zodFieldRule } from "@/lib/authValidation";
import ConsentCheckbox from "@/components/ConsentCheckbox";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

// Same options the server accepts (src/lib/profileValidation.ts)
const ageOptions = AGE_OPTIONS;
const gradeOptions = GRADE_OPTIONS;
type Props = {
  onComplete: () => void,
  userId: string | string[] | undefined; 
  userData: any
}
const ProfileForm = ({onComplete, userId, userData}: Props) => {
  const [localImage, setLocalImage] = useState<string | null>(null); // Local preview image
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
    getValues,
  } = useForm<ProfileFormValues>();

  // Email (add-only): accounts without one can add it here; accounts with one
  // only see it masked. userData never contains the full address.
  const hasParentEmail = Boolean(userData?.hasParentEmail);
  const showAddParentEmail = !hasParentEmail;
  // Shown on "My Profile" only - not on the first profile step right after sign-up
  const showMaskedParentEmail = hasParentEmail && Boolean(userData?.profileUpdated);
  // The three fields are optional, but all-or-nothing
  const parentEmailStarted = () => {
    const v = getValues();
    return Boolean((v.parentEmail ?? "").trim() || (v.confirmParentEmail ?? "").trim() || v.acceptedTerms);
  };
  useEffect(() => {
    if (userData) {
      setValue("firstName", userData.firstName ?? "");
      setValue("lastName", userData.lastName ?? "");
      setValue("age", userData.age ?? "");
      setValue("grade", userData.grade ?? "");
      setValue("profileImage", userData.profileImage ?? "");
    }
  }, [userData, setValue]);
  const profileImage = watch("profileImage");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Send the email fields only when the section is shown and was filled in
  const buildPayload = (data: ProfileFormValues) => {
    const { parentEmail, confirmParentEmail, acceptedTerms, ...profile } = data;
    if (!showAddParentEmail || !parentEmailStarted()) return profile;
    return { ...profile, parentEmail, confirmParentEmail, acceptedTerms: acceptedTerms === true };
  };
  const submitForm = async (data: ProfileFormValues) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (typeof userId === "string") {
        const response = await fetch("/api/auth/updateProfile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: buildPayload(data), userId }),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(
            response.status === 401
              ? "Your session has expired. Please log in again."
              : response.status === 400 && typeof result.error === "string"
              ? result.error
              : "We couldn't save your profile. Please try again."
          );
        }
          onComplete()
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      setSaveError(
        error instanceof TypeError
          ? "Couldn't reach the server. Please check your connection and try again."
          : error instanceof Error
          ? error.message
          : "We couldn't save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };
  const [uploadError, setUploadError] = useState<string | null>(null);
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Clear the input so picking the same file again still triggers onChange
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Please choose a .png or .jpeg image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError("Image is too large. Please choose one up to 8 MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setLocalImage(localPreview);

    startTransition(async () => {
      try {
        const uniqueFileName = `profile/${userId}_${uuidv4()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("izzyspell-bucket")
          .upload(uniqueFileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const uploadedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${data.fullPath}`;
        setValue("profileImage", uploadedImageUrl);
        setLocalImage(null);
      } catch (error) {
        // Covers both storage errors and network failures (e.g. storage unreachable)
        console.error("File upload failed:", error);
        setLocalImage(null);
        setUploadError("Image upload failed. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <div className="flex justify-center">
        <div className="relative flex items-center h-20 w-72">
          <Image
            src="/images/izzyLogo.svg"
            alt="Logo"
            width={300}
            height={40}
            className="mx-auto"
          />
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <Image
          src="/images/titles/profileTitle.svg"
          alt="Profile Title"
          width={40}
          height={20}
          className="w-80"
          priority={true}
        />
      </div>
      <div className="flex gap-3 mb-6">
        <div className="w-20 h-20 rounded-xl overflow-hidden mb-3">
          <Image
            src={localImage || profileImage || "/images/avatar.png"}
            alt="User avatar"
            width={80}
            height={80}
            priority={true}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="file-upload"
            className="bg-green text-white text-sm px-4 py-1.5 rounded-lg mb-2 cursor-pointer"
          >
            {isPending ? "Uploading..." : "Upload Image"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={handleFileUpload}
          />
          <p className="text-xs text-gray-500">.png, .jpeg files up to 8 MB</p>
          {uploadError && (
            <p className="text-xs text-red-500 mt-1">{uploadError}</p>
          )}
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <InputField
          id="firstName"
          register={register}
          errors={errors}
          fieldName="firstName"
          type="text"
          requiredValue={true}
          rules={{ validate: zodFieldRule(firstNameSchema) }}
          placeholder="First Name"
        />
        <InputField
          id="lastName"
          register={register}
          errors={errors}
          fieldName="lastName"
          type="text"
          requiredValue={true}
          rules={{ validate: zodFieldRule(lastNameSchema) }}
          placeholder="Last Name"
        />
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Please select your Age
        </p>
        <Controller
          name="age"
          control={control}
          defaultValue=""
          rules={{ required: "Please select your Age" }}
          render={({ field }) => (
            <>
              <RadioGroup value={field.value} onChange={field.onChange}>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {ageOptions.map((age) => (
                    <Radio key={age} value={age}>
                      {({ checked }) => (
                        <AgeGradeSelectionButton
                          label={age}
                          fullWidth={false}
                          className={`px-3 py-1 rounded-md border w-full ${
                            checked
                              ? "bg-green text-white data-[hover]:bg-hoverGreen"
                              : "bg-white !text-green border-green data-[hover]:!text-white data-[hover]:bg-hoverGreen"
                          }`}
                        />
                      )}
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.age.message}
                </p>
              )}
            </>
          )}
        />
      </div>
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Please select your Grade
        </p>
        <Controller
          name="grade"
          control={control}
          defaultValue=""
          rules={{ required: "Please select your Grade" }}
          render={({ field }) => (
            <>
              <RadioGroup value={field.value} onChange={field.onChange}>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {gradeOptions.map((grade) => (
                    <Radio key={grade} value={grade}>
                      {({ checked }) => (
                        <AgeGradeSelectionButton
                          label={grade}
                          fullWidth={false}
                          className={`px-3 py-1 rounded-md border w-full ${
                            checked
                              ? "bg-green text-white data-[hover]:bg-hoverGreen"
                              : "bg-white !text-green border-green data-[hover]:!text-white data-[hover]:bg-hoverGreen"
                          }`}
                        />
                      )}
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
              {errors.grade && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.grade.message}
                </p>
              )}
            </>
          )}
        />
      </div>
      {showAddParentEmail && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
          <p className="text-xs text-gray-500 mb-2">
            Add an email so a password reset link can be sent if the password is ever forgotten.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <InputField
              id="parentEmail"
              register={register}
              errors={errors}
              fieldName="parentEmail"
              type="text"
              requiredValue={false}
              placeholder="Email"
              rules={{
                validate: (value: string) => !parentEmailStarted() || zodFieldRule(emailSchema)(value),
              }}
            />
            <InputField
              id="confirmParentEmail"
              register={register}
              errors={errors}
              fieldName="confirmParentEmail"
              type="text"
              requiredValue={false}
              placeholder="Confirm Email"
              rules={{
                validate: (value: string) =>
                  !parentEmailStarted() ||
                  normalizeEmail(value) === normalizeEmail(getValues("parentEmail")) ||
                  AUTH_MESSAGES.parentEmailsDoNotMatch,
              }}
            />
            <ConsentCheckbox
              registration={register("acceptedTerms", {
                shouldUnregister: true,
                validate: (value?: boolean) => !parentEmailStarted() || value === true || AUTH_MESSAGES.termsRequired,
              })}
              error={errors.acceptedTerms?.message}
            />
          </div>
        </div>
      )}
      {showMaskedParentEmail && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
          <p className="text-sm text-darkBlue">Email: {userData?.parentEmailMasked}</p>
          <p className="text-xs text-gray-500 mt-1">
            To change it, contact support
            {SUPPORT_EMAIL ? (
              <>
                {" "}at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold underline">
                  {SUPPORT_EMAIL}
                </a>
              </>
            ) : null}
            .
          </p>
        </div>
      )}
      {saveError && (
        <p className="text-red-500 text-sm text-center mb-3">{saveError}</p>
      )}
      <div className="flex w-full justify-center">
        <div className="w-full max-w-md px-4">
          <CustomButton
            disabled={isPending}
            loading={saving}
            className="border-white"
            type="submit"
            label="Next"
            fullWidth
          />
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;


