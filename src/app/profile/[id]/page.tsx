import { auth } from "@/auth";
import MultiStepForm from "./MultiStepForm";
import { Session } from "next-auth";
import { getUserDetails } from "@/app/actions/getUserDetails";
const ProfilePage = async () => {
  const session = (await auth()) as Session | null;
    const user = session?.user;
  
    if (!user) {
      return <div>Loading...</div>;
    }
  
    const userData = user?.id ? await getUserDetails(user.id) : undefined;
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-profile-background bg-cover bg-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-screen-md">
        <MultiStepForm userId={user.id} userData={userData} />
      </div>
    </div>
  );
}

export default ProfilePage
