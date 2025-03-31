"use client";

import React, { useState, useEffect } from "react";
import HeroContent from "../sub/HeroContent";

const Hero = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Listen for theme changes from the navbar
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

  return (
    <div className="relative flex flex-col h-full w-full" id="home">
      <div 
        className="absolute top-0 z-[1] h-full w-full bg-[#0F0F0F]"
      >
        <div className="absolute z-[-1] h-full w-full opacity-30">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-grid-pattern z-[-1]"></div>
        </div>
      </div>
      <HeroContent isDarkMode={isDarkMode} />
    </div>
  );
};

export default Hero;