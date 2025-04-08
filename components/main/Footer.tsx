"use client";

import React, { useState, useEffect } from "react";
import { EnvelopeIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const Footer = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Listen for theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(!document.documentElement.classList.contains('light-mode'));
    };
    
    // Initial check
    checkTheme();
    
    // Set up mutation observer to watch for class changes on documentElement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Dynamic classes based on theme
  const bgClass = isDarkMode ? "bg-[#080808]" : "bg-gray-100";
  const textClass = isDarkMode ? "text-gray-200" : "text-gray-800";
  const headingClass = isDarkMode ? "text-white" : "text-gray-900";
  const borderClass = isDarkMode ? "border-gray-800" : "border-gray-300";
  const linkClass = isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-blue-600";
  const iconClass = isDarkMode ? "text-red-500" : "text-blue-500";
  const socialClass = isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-blue-600";
  const footerTextClass = isDarkMode ? "text-gray-400" : "text-gray-500";

  // Email information - direct Gmail compose link
  const emailAddress = "debarghyasren@gmail.com";
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}`;

  return (
    <footer className={`w-full ${bgClass} ${textClass} border-t ${borderClass} transition-colors duration-500 relative z-10`} id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Section */}
          <div className="flex flex-col">
            <h3 className={`text-lg font-semibold ${headingClass} mb-4 pb-2 border-b ${borderClass} transition-colors duration-500`}>Contact</h3>
            <div className={`flex items-center gap-3 ${linkClass} mb-3 transition-colors duration-500`}>
              <EnvelopeIcon className={`w-5 h-5 ${iconClass} transition-colors duration-500`} />
              <a 
                href={gmailComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} transition-colors duration-500`}
              >
                debarghyasren@gmail.com
              </a>
            </div>
            <div className={`flex items-center gap-3 ${linkClass} mb-3 transition-colors duration-500`}>
              <svg className={`w-5 h-5 ${iconClass} transition-colors duration-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:+919147031684" className={`${linkClass} transition-colors duration-500`}>
                +91 9147031684
              </a>
            </div>
            <div className={`flex items-center gap-3 ${linkClass} transition-colors duration-500`}>
              <DocumentTextIcon className={`w-5 h-5 ${iconClass} transition-colors duration-500`} />
              <a 
                href="/Debarghya_Saha_newresume.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} transition-colors duration-500 flex items-center`}
              >
                <span>Resume</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Connect Section */}
          <div className="flex flex-col">
            <h3 className={`text-lg font-semibold ${headingClass} mb-4 pb-2 border-b ${borderClass} transition-colors duration-500`}>Connect</h3>
            <div className="flex flex-col space-y-4">
              <a 
                href="https://github.com/debarghyaRONIN" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${socialClass} transition-colors duration-500 flex items-center gap-2`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/debarghya-saha-99baa624a/" 
                target="_blank"
                rel="noopener noreferrer"
                className={`${socialClass} transition-colors duration-500 flex items-center gap-2`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-.88-.06-1.601-1-1.601-1 0-1.16.781-1.16 1.601v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className={`mt-8 pt-8 border-t ${borderClass} text-center ${footerTextClass} text-sm transition-colors duration-500`}>
        </div>
      </div>
    </footer>
  );
};

export default Footer;