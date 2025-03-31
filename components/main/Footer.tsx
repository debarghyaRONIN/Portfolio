import React from "react";
import Image from "next/image";
import { EnvelopeIcon } from "@heroicons/react/24/solid";

const Footer = () => {
  return (
    <div className="w-full h-full bg-transparent text-gray-200 shadow-lg p-[15px]">
      <div className="w-full flex flex-col items-center justify-center m-auto">
        <div className="w-full h-full flex flex-row items-center justify-center flex-wrap">
          <div className="min-w-[200px] h-auto flex flex-col items-center justify-start">
            <div className="font-bold text-[16px]">Contact</div>
            <p className="flex flex-row items-center my-[15px] cursor-pointer">
              <EnvelopeIcon className="h-5 w-5" />
              <span className="text-[15px] ml-[6px]">debarghyasren@gmail.com</span>    
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;