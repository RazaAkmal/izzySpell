'use client'
import CustomButton from "@/components/HeadlessButton";
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function SuccessModal() {
  const router = useRouter();

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <Image
          src="/images/Success.svg"
          alt="Success"
          width={460}
          height={427}
        />
      </div>
      <p className="text-purple mt-1">
        Now you can start using IzzySpell to learn and have fun.
      </p>
      <div className="flex w-full justify-center">
        <div className="w-full max-w-md px-4">
          <CustomButton
            onClick={(event)=> {
              event.preventDefault();
              router.push('/dashboard')}
            }
            className="border-white"
            type="submit"
            label="Start Learning"
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
