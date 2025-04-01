"use client";

import { useEffect } from "react";
import { initializeGSAPAnimations } from "@/utils/gsapAnimations";

export function AnimationInitializer() {
  useEffect(() => {
    // Initialize all GSAP animations
    if (typeof window !== "undefined") {
      initializeGSAPAnimations();
    }
  }, []);

  // This component doesn't render anything
  return null;
}

export default AnimationInitializer; 