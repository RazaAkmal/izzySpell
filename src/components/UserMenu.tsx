"use client";
import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SignOut } from "./signOut";
const UserMenu = ({ userId }: { userId: string | undefined }) => {
  const router = useRouter();

  return (
    <Menu as="div" className="relative">
      <MenuButton className="focus:outline-none">
        <Image
          src="/images/Dropdown.svg"
          alt="Dropdown Button"
          width={30}
          height={30}
          className="cursor-pointer mt-2"
        />
      </MenuButton>
      <MenuItems className="absolute right-0 w-28 min-w-fit mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
        <MenuItem>
          <button
            onClick={() => {
              router.push(`/profile/${userId}`);
            }}
            className="block px-4 py-1 w-full text-left text-gray-700 hover:bg-gray-100 hover:text-black"
          >
            My Profile
          </button>
        </MenuItem>
        <MenuItem>
          <SignOut />
        </MenuItem>
      </MenuItems>
    </Menu>
  );
};

export default UserMenu;
