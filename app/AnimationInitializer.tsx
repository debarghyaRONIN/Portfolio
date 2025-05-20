"use client";

import { useEffect } from "react";
import { initializeGSAPAnimations } from "@/utils/gsapAnimations";

const AnimationInitializer = () => {
  useEffect(() => {
    // Initialize all GSAP animations
    if (typeof window !== "undefined") {
      initializeGSAPAnimations();
      
      // Remove smooth scroll behavior since we're using GSAP
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = anchor.getAttribute('href');
          if (targetId && targetId.startsWith('#')) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              const rect = targetElement.getBoundingClientRect();
              window.scrollTo({
                top: window.scrollY + rect.top - 80,
                behavior: 'instant'
              });
            }
          }
        });
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default AnimationInitializer;