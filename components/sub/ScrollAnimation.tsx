"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface Props {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  className?: string;
  parallaxIntensity?: number; // 0-1 scale where 1 is maximum parallax effect
  delay?: number;
  duration?: number;
  once?: boolean;
}

const ScrollAnimation = ({
  children,
  direction = "up",
  className = "",
  parallaxIntensity = 0.2,
  delay = 0,
  duration = 0.8,
  once = true,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
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

  // Get scroll progress relative to the element
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  
  // Smooth out the scroll progress for more natural animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate parallax values based on direction and intensity
  const yParallax = useTransform(
    smoothProgress,
    [0, 1],
    direction === "up" || direction === "down" 
      ? [parallaxIntensity * 100, -parallaxIntensity * 100] 
      : [0, 0]
  );
  
  const xParallax = useTransform(
    smoothProgress,
    [0, 1],
    direction === "left" || direction === "right" 
      ? [parallaxIntensity * 100, -parallaxIntensity * 100] 
      : [0, 0]
  );
  
  const opacityProgress = useTransform(smoothProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0.8]);

  // Set initial animation values based on direction
  const getInitialValues = () => {
    const initialValues = { opacity: 0 };
    
    switch (direction) {
      case "up":
        return { ...initialValues, y: 60 };
      case "down":
        return { ...initialValues, y: -60 };
      case "left":
        return { ...initialValues, x: 60 };
      case "right":
        return { ...initialValues, x: -60 };
      default:
        return { ...initialValues, y: 60 };
    }
  };

  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      <motion.div
        initial={getInitialValues()}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        transition={{
          duration,
          delay,
          ease: [0.33, 1, 0.68, 1], // Cubic bezier curve for smoother motion
        }}
        viewport={{ once }}
        style={{ 
          y: direction === "up" || direction === "down" ? yParallax : 0,
          x: direction === "left" || direction === "right" ? xParallax : 0
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
      
      {/* Optional spotlight effect that follows scroll progress */}
      <motion.div 
        className={`absolute pointer-events-none w-full h-full top-0 left-0 opacity-60 
          bg-radial-gradient from-transparent ${
            isDarkMode 
              ? 'via-transparent to-black/80' 
              : 'via-transparent to-white/80'
          }`}
        style={{ 
          opacity: opacityProgress,
          background: isDarkMode 
            ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.05) 0%, rgba(0,0,0,0) 70%)',
        }}
      />
    </div>
  );
};

export default ScrollAnimation; 