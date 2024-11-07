import ProfileForm from "./ProfileForm";

export default function ProfileSetup() {
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-login-background p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-screen-md">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
          IzzySpell
        </h1>
        <p className="text-lg text-center text-purple mb-6">
          Let&apos;s Setup Profile
        </p>
        <ProfileForm />
      </div>
    </div>
  );
}
