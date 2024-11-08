"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Radio, RadioGroup } from "@headlessui/react";
import { ProfileFormValues } from "@/lib/defination";

const ageOptions = ["6-7", "7-8", "8-9", "9-10", "10-11", "11-12"];
const gradeOptions = [
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
];

const ProfileForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const submitForm = async (data: ProfileFormValues) => {  
    try {
      if (typeof id === "string") {
        const response = await fetch('/api/auth/updateProfile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data, userId: id }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Profile update failed');
        }
  
        const user = await response.json();
  
        if (user.profileUpdated) {
          // Redirect to dashboard if profile is updated
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };
  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <div className="flex gap-3 mb-6">
        <div className="w-20 h-20 rounded-xl overflow-hidden mb-3">
          <Image
            src="/images/avatar.png" // Placeholder for user avatar
            alt="User avatar"
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col">
          <button className="bg-green text-white text-sm px-4 py-1.5 rounded-lg mb-2">
            Upload Image
          </button>
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
                      <CustomButton
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
              <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
            )}</>
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
                      <CustomButton
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
              <p className="text-red-500 text-sm mt-1">{errors.grade.message}</p>
            )}</>
          )}
        />
      </div>
      <div className="flex w-full justify-center">
        <div className="w-full max-w-md px-4">
          <CustomButton className="border-white" type="submit" label="Next" fullWidth />
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
