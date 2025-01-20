"use client";
import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import CardDetailsForm from "./CardDetailsForm";
import SuccessModal from "./SuccessModal";

type Props = {
  userId: string | string[] | undefined;
  userData: any
};
const MultiStepForm = ({ userId, userData }: Props) => {
  const [step, setStep] = useState(1);

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  return (
    <div className="multi-step-form-container">
      {step === 1 && (
        <ProfileForm
          userId={userId}
          userData={userData}
          onComplete={handleNextStep}
        />
      )}
      {step === 2 && (
        <CardDetailsForm userId={userId} onComplete={handleNextStep} />
      )}
      {step === 3 && <SuccessModal />}
    </div>
  );
};

export default MultiStepForm;
