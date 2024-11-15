'use client'
import { useParams } from "next/navigation";
import MultiStepForm from "./MultiStepForm";
export default function ProfileSetup() {
  const params = useParams();
  const { id } = params;
  return (
    <div className="flex items-center justify-center min-h-screen bg-profile-background bg-cover bg-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-screen-md">
        <MultiStepForm userId={id} />
      </div>
    </div>
  );
}
