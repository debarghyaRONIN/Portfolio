"use client";

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorVariant, setCursorVariant] = useState('default');
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

  useEffect(() => {
    // Function to update mouse position
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Check if device has coarse pointer (touch screen)
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    
    // Only add event listeners if not on touch device
    if (!hasCoarsePointer) {
      window.addEventListener('mousemove', updateMousePosition);
      
      // Track hovering over interactive elements
      const handleMouseEnterInteractive = () => {
        setIsHovering(true);
        setCursorVariant('hover');
      };
      
      const handleMouseLeaveInteractive = () => {
        setIsHovering(false);
        setCursorVariant('default');
      };
      
      // Track mouse clicks
      const handleMouseDown = () => setIsClicking(true);
      const handleMouseUp = () => setIsClicking(false);
      
      // Add event listeners for all interactive elements
      const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select, [tabindex]:not([tabindex="-1"])');
      
      interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', handleMouseEnterInteractive);
        element.addEventListener('mouseleave', handleMouseLeaveInteractive);
      });
      
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', updateMousePosition);
        
        interactiveElements.forEach(element => {
          element.removeEventListener('mouseenter', handleMouseEnterInteractive);
          element.removeEventListener('mouseleave', handleMouseLeaveInteractive);
        });
        
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, []);

  // Variants for cursor animation
  const cursorVariants: Variants = {
    default: {
      x: mousePosition.x - 8,
      y: mousePosition.y - 8,
      height: isClicking ? 10 : 16,
      width: isClicking ? 10 : 16,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      mixBlendMode: isDarkMode ? "difference" : "normal" as any,
      borderRadius: '50%',
      border: isDarkMode ? '2px solid rgba(255, 255, 255, 0.8)' : '2px solid rgba(0, 0, 0, 0.5)'
    },
    hover: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      height: 40,
      width: 40,
      backgroundColor: 'transparent',
      mixBlendMode: isDarkMode ? "difference" : "normal" as any,
      border: isDarkMode 
        ? '2px solid rgba(255, 255, 255, 0.7)' 
        : '2px solid rgba(59, 130, 246, 0.7)',
      borderRadius: '50%'
    }
  };

  // Check if device has coarse pointer (touch screen)
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null; // Don't render custom cursor on touch devices
  }

  return (
    <>
      <motion.div
        className="hidden md:block fixed top-0 left-0 z-50 pointer-events-none"
        variants={cursorVariants}
        animate={cursorVariant}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      />
      
      {/* Cursor trail effect */}
      <motion.div 
        className="hidden md:block fixed top-0 left-0 z-[49] w-2 h-2 rounded-full pointer-events-none"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          opacity: isHovering ? 0 : 0.5,
          backgroundColor: isDarkMode 
            ? isHovering ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 0.8)' 
            : isHovering ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.5)'
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.2
        }}
      />
    </>
  );
};

export default CustomCursor; 