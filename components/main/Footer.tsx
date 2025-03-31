import React from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const Footer = () => {
  return (
    <div className="w-full h-full bg-transparent text-gray-200 shadow-lg p-[15px]">
      <div className="w-full flex flex-col items-center justify-center m-auto">
        <div className="w-full h-full flex flex-row items-center justify-center flex-wrap">
          <div className="min-w-[200px] h-auto flex flex-col items-center justify-start">
  
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Contact</h3>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <EnvelopeIcon className="w-5 h-5" />
                <a href="mailto:debarghyasren@gmail.com" className="hover:text-white transition-colors">
                  debarghyasren@gmail.com
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-300 mt-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+919147031684" className="hover:text-white transition-colors">
                  +91 9147031684
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;