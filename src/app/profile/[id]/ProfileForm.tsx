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

const ageOptions = ["6-7", "7-8", "8-9", "9-10", "10-11", "11-12"];
const gradeOptions = [
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
];
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
  } = useForm<ProfileFormValues>();
  console.log(userData)
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
  const submitForm = async (data: ProfileFormValues) => {
    try {
      if (typeof userId === "string") {
        const response = await fetch("/api/auth/updateProfile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data, userId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Profile update failed");
        }
          onComplete()
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setLocalImage(localPreview);

    startTransition(async () => {
      const uniqueFileName = `profile/${userId}_${uuidv4()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("izzyspell-bucket")
        .upload(uniqueFileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("File upload failed:", error);
        return;
      }

      const uploadedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${data.fullPath}`;
      setValue("profileImage", uploadedImageUrl);
      setLocalImage(null);
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
            className="hidden"
            onChange={handleFileUpload}
          />
          <p className="text-xs text-gray-500">.png, .jpeg files up to 8 MB</p>
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
          placeholder="First Name"
        />
        <InputField
          id="lastName"
          register={register}
          errors={errors}
          fieldName="lastName"
          type="text"
          requiredValue={true}
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
      <div className="flex w-full justify-center">
        <div className="w-full max-w-md px-4">
          <CustomButton
            disabled={isPending}
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


