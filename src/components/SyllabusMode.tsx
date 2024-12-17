"use client";

import React, { useState } from "react";
import Image from "next/image";
import CustomButton from "./HeadlessButton";
import { Button } from "@headlessui/react";

function SyllabusModePage() {
  return (
    <div className="bg-skyBlue m-3 max-h-max rounded-md p-6">
      <div className="w-full flex flex-wrap justify-between items-center mb-4 gap-4">
        <div className="flex-shrink-0">
          <CustomButton
            label={`Page 1/5`}
            variant="success"
            size="small"
            radius="rounded"
            img="/images/bookIcon.svg"
          />
        </div>

        <div className="flex-grow">
          <div className="flex-shrink-0">
            <div className="flex justify-end">
              <Button className="focus:outline-none">
                <Image
                  src="/images/Vector.svg"
                  alt="Cancel Button"
                  width={24}
                  height={24}
                  className="w-8 h-8"
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SyllabusModePage;
