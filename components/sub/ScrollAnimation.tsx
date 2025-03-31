"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin with GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimationProps {
  children: React.ReactNode;
  wrapperClass?: string;
}

const ScrollAnimation = ({ children, wrapperClass = "" }: ScrollAnimationProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const section = sectionRef.current;
    
    // Initial setup - hide section
    gsap.set(section, { 
      opacity: 0,
      y: 50 
    });
    
    // Create scroll trigger animation
    const animation = gsap.to(section, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%", // Animation starts when the top of the section is 80% from the top of the viewport
        end: "bottom 20%",
        toggleActions: "play none none reverse", // play on enter, reverse on exit
      }
    });
    
    return () => {
      // Clean up animation when component unmounts
      animation.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  return (
    <div ref={sectionRef} className={`${wrapperClass}`}>
      {children}
    </div>
  );
};

export default ScrollAnimation; 