import React from "react";
import { useForm } from "react-hook-form";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import Image from "next/image";
import CardDropDown from "@/components/CardDropDown";
import { expiryYearOptions, monthOptions } from "@/lib/constant";
import { CardDetailsFormValues } from "@/lib/defination";

type Props = {
  onComplete: () => void;
  userId: string | string[] | undefined;
};

const CardDetailsForm = ({ onComplete, userId }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CardDetailsFormValues>({
    defaultValues: { expireYear: expiryYearOptions[0] },
  });

  const submitForm = async (data: CardDetailsFormValues) => {
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

        const user = await response.json();

        if (user.profileUpdated) {
          onComplete();
        }
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center h-20 w-72">
        <Image
          src="/images/izzyLogo.svg"
          alt="Logo"
          width={300}
          height={40}
          className="mx-auto"
        />
      </div>
      <div className="relative flex items-center h-20 w-72">
        <Image
          src="/images/titles/PaymentTitle.svg"
          alt="payment title"
          width={300}
          height={40}
          className="mx-auto"
        />
      </div>

      <form onSubmit={handleSubmit(submitForm)}>
        <div className="border border-blueStroke p-8 rounded-lg shadow-md mb-4 max-w-md">
          <div className="mb-4">
            <InputField
              id="cardNumber"
              register={register}
              errors={errors}
              fieldName="cardNumber"
              type="number"
              placeholder="1234  8765  7654  9812"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              requiredValue={false}
            />
          </div>
          <div className="mb-4">
            <InputField
              id="cardName"
              register={register}
              errors={errors}
              fieldName="cardName"
              type="text"
              placeholder="Myra Goodwin"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              requiredValue={false}
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              {" "}
              {/* This line was missing a closing `>` */}
              <div className="w-1/3 mr-2">
                <CardDropDown
                  setValue={setValue}
                  options={monthOptions}
                  register={register}
                  fieldName={"expireMonth"}
                  errors={errors}
                />
              </div>
              <div className="w-1/3 mr-2">
                <CardDropDown
                  setValue={setValue}
                  options={expiryYearOptions}
                  register={register}
                  fieldName={"expireYear"}
                  errors={errors}
                />
              </div>
              <div className="w-1/3">
                <InputField
                  id="cardCVC"
                  register={register}
                  errors={errors}
                  fieldName="cardCVC"
                  type="number"
                  placeholder="CVC"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  requiredValue={false}
                />
              </div>
            </div>
          </div>
        </div>
        <CustomButton
          type="submit"
          label="Let's Go"
          fullWidth
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        />
      </form>
    </div>
  );
};

export default CardDetailsForm;
