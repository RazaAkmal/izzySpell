"use client";
import CustomButton from "@/components/HeadlessButton";
import { Dialog, DialogPanel } from "@headlessui/react";
import Image from "next/image";
export default function SuccessSignUpModal({
  isOpen,
  handleNavigate,
}: {
  isOpen: boolean;
  handleNavigate: () => void;
}) {
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={close}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-black/5 p-20 md:px-20 px-8 backdrop-blur-3xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <div className="relative flex items-center mb-10 h-20">
              <Image
                src="/images/izzyLogo.svg"
                alt="signup title"
                width={300}
                height={40}
                className="mx-auto"
              />
            </div>
            <div className="w-full max-w-md px-4">
              <p className="text-purple my-12">
                Signup successful! Welcome aboard. You can now log in and start
                exploring.
              </p>
              <CustomButton
                onClick={handleNavigate}
                className="border-white"
                type="submit"
                label="Login Now..."
                fullWidth
              />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
