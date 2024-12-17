import React from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import { useRouter,useParams } from "next/navigation";


interface PracticeWordModalProps
{
    isOpen:boolean;
    onClose:()=>void
}

const PracticeWordModal: React.FC<PracticeWordModalProps> = ({ isOpen,  onClose }) => {
    if (!isOpen) return null; 
    const router=useRouter();
    const {listId}=useParams();

    //for Default mode 
    const handleDefaultMode=()=>
    {
      
        router.push(`/spellPractice/${listId}/DefualtModePratice`)
    }
    //for Slyyabus mode 
    const handleSyllabusMode=()=>
    {
        router.push(`/spellPractice/${listId}/SllyabusModePractice`)
    }
    //for group word mode 
    const handleGroupMode=()=>
    {
        router.push(`/spellPractice/${listId}/GroupModePractice`)  
    }


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      
        <div className="bg-skyBlue border-2 border-sky-300 flex flex-col rounded-2xl shadow-lg p-12 max-w-screen-md w-full sm:w-11/12 md:w-4/5 lg:w-2/3 z-10">
          <div className="flex justify-end">
            <Button onClick={onClose} className="focus:outline-none">
            <Image
                src="/images/Vector.svg"
                alt="Cancel Button"
                width={24}
                height={24}
                className="w-8 h-8"
                onClick={onClose}
              />
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
          <Image
            src="/images/titles/Please Choose a Mode to Practice Your Word List.svg"
            alt="Logo"
            width={500}
            height={40}
            className=" mx-auto"
          />
          </div>

          {/* Modes section */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {/* Default Mode */}
            <div className="bg-white flex flex-col items-center justify-center gap-2 p-4 rounded-lg shadow-md w-36 sm:w-40 md:w-48 cursor-pointer hover:bg-blue-100" onClick={handleDefaultMode}>
              <img
                src="/images/DefaultMode.svg"
                alt="Default Mode"
                className="w-20 h-16 sm:w-24 sm:h-24"
              />
              <span className="text-lg sm:text-md font-bold text-blue">
                Default Mode
              </span>
            </div>

            {/* Syllabus Mode */}
            <div className="bg-white flex flex-col items-center justify-center gap-2 p-4 rounded-lg shadow-md w-36 sm:w-40 md:w-48 cursor-pointer hover:bg-blue-100" onClick={handleSyllabusMode}>
              <img
                src="/images/SyllabusMode.svg"
                alt="Syllabus Mode"
                className="w-20 h-16 sm:w-24 sm:h-24"
              />
              <span className="text-lg sm:text-md font-bold text-blue">
                Syllabus Mode
              </span>
            </div>

            {/* Word Groups Mode */}
            <div className="bg-white flex flex-col items-center justify-center gap-2 p-4 rounded-lg shadow-md w-36 sm:w-40 md:w-48 cursor-pointer hover:bg-blue-100" onClick={handleGroupMode}>
              <img
                src="/images/GroupMode.svg"
                alt="Word Groups Mode"
                className="w-20 h-14 sm:w-24 sm:h-24"
              />
              <span className="text-lg sm:text-md font-bold text-blue ">
                Word Groups Mode
              </span>
            </div>
          </div>

          {/* Footer button */}
          <div className="flex justify-center mt-4">
            <CustomButton
              label="Save & Start Learning"
              fullWidth={false}
              size="large"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default PracticeWordModal;
