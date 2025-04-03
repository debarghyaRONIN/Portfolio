"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Import components with SSR disabled to prevent hydration errors
const ParallaxBackground = dynamic(
  () => import("@/components/sub/ParallaxBackground"),
  { ssr: false }
);

const AnimationInitializer = dynamic(
  () => import("./AnimationInitializer"),
  { ssr: false }
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <>
      {isMounted && (
        <>
          <ParallaxBackground isDarkMode={isDarkMode} />
          <AnimationInitializer />
        </>
      )}
      {children}
    </>
  );
} 