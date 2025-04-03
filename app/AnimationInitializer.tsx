"use client";

import { useEffect } from "react";
import { initializeGSAPAnimations } from "@/utils/gsapAnimations";
import { AnimatePresence } from "framer-motion";

export function AnimationInitializer() {
  useEffect(() => {
    // Initialize all GSAP animations
    if (typeof window !== "undefined") {
      initializeGSAPAnimations();
      
      // Add smooth scroll behavior to all anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = anchor.getAttribute('href');
          if (targetId && targetId.startsWith('#')) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }
        });
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}

export default AnimationInitializer; 