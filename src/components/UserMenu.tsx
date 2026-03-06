"use client";
import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SignOut } from "./signOut";
const UserMenu = ({ userId }: { userId: string | undefined }) => {
  const router = useRouter();

  const handleNavigateToProfile = () => {
    const isNavigate = localStorage.getItem("isNavigate");
    if (isNavigate === "false") {
      router.push(`/profile/${userId}`);
      localStorage.removeItem("isNavigate");
    } else if (isNavigate === "false") {
      const userConfirmed = confirm("Changes you made may not be saved. Are you sure you want to continue?");
      if (userConfirmed) {
        router.push(`/profile/${userId}`);
        localStorage.removeItem("isNavigate");
      }
    } else {
      router.push(`/profile/${userId}`);
      localStorage.removeItem("isNavigate");
    }
  };
  
  return (
    <Menu as="div" className="relative">
      <MenuButton className="focus:outline-none w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
        <Image
          src="/images/DropDown.svg"
          alt="Dropdown Button"
          width={22}
          height={22}
          className="cursor-pointer"
        />
      </MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-[#D5EDFF] z-50 overflow-hidden focus:outline-none">
        {/* Colorful accent strip */}
        <div className="h-1 bg-gradient-to-r from-[#4793FE] to-[#956CFC]" />
        <div className="p-2">
          <MenuItem>
            {({ focus }) => (
              <button
                onClick={handleNavigateToProfile}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left font-bold text-[#426096] transition-colors ${focus ? "bg-[#D5EDFF] text-[#4793FE]" : ""}`}
              >
                <span className="w-8 h-8 rounded-full bg-[#ECF4FF] flex items-center justify-center text-base flex-shrink-0">👤</span>
                <span className="text-sm">My Profile</span>
              </button>
            )}
          </MenuItem>
          <div className="mx-3 my-1 border-t border-[#ECF4FF]" />
          <MenuItem>
            {({ focus }) => (
              <SignOut focusStyle={focus} />
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
};

export default UserMenu;
