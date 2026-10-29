"use client";
import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
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
      {/* The profile step alone completes onboarding (no card step) */}
      {step === 2 && <SuccessModal />}
    </div>
  );
};

export default MultiStepForm;
