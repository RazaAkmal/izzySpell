import ProfileForm from "./ProfileForm";
import Image from "next/image";
export default function ProfileSetup() {
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-login-background p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-screen-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          IzzySpell
        </h1>
        <div className="flex justify-center mb-6">
        <Image
            src="/images/titles/profileTitle.svg"
            alt="User avatar"
            width={40}
            height={20}
            className="w-80"
          />
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
