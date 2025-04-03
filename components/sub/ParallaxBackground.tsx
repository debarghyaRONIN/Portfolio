"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';

interface ParallaxBackgroundProps {
  isDarkMode?: boolean;
}

// Simple seeded random function to ensure consistent generation between server and client
function seededRandom(seed: number) {
  const m = 2**35 - 31;
  const a = 185852;
  let s = seed % m;
  
  return function() {
    return (s = s * a % m) / m;
  };
}

const ParallaxBackground = ({ isDarkMode = true }: ParallaxBackgroundProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { scrollY } = useScroll();
  
  // Create motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Parallax effect based on scroll
  const backgroundY = useTransform(scrollY, [0, 3000], [0, -300]);
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  
  // Generate background elements with consistent randomness
  const particles = useMemo(() => {
    // Use a fixed seed for random generation
    const random = seededRandom(12345);
    
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: random() * 10 + 2,
      x: random() * 100,
      y: random() * 100,
      depth: random() * 3 + 1,
      opacity: random() * 0.5 + 0.1,
      color: isDarkMode 
        ? `rgba(${255}, ${100 + random() * 155}, ${random() * 50}, ${0.2 + random() * 0.3})`
        : `rgba(${random() * 50}, ${100 + random() * 155}, ${255}, ${0.2 + random() * 0.3})`,
      animX: random() * 15 - 7.5,
      animY: random() * 15 - 7.5,
      duration: 3 + random() * 7
    }));
  }, [isDarkMode]);

  // Set up client-side only effects
  useEffect(() => {
    setIsMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position as percentage of viewport
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      // Update motion values
      mouseX.set((x - 0.5) * -50);
      mouseY.set((y - 0.5) * -50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!isMounted) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    >
      {/* Main gradient background */}
      <motion.div 
        className={isDarkMode 
          ? "absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800" 
          : "absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-white"
        }
        style={{ 
          y: backgroundY,
          opacity: backgroundOpacity 
        }}
      />
      
      {/* Animated particles - with simpler animation approach */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full transform-gpu animate-gpu"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            transform: `translate(${mouseX.get() * particle.depth * 0.05}px, ${mouseY.get() * particle.depth * 0.05 + backgroundY.get() / (10 * particle.depth)}px)`,
          }}
          animate={{
            x: [0, particle.animX],
            y: [0, particle.animY],
            transition: {
              repeat: Infinity,
              repeatType: "reverse",
              duration: particle.duration,
              ease: "easeInOut"
            }
          }}
        />
      ))}
      
      {/* Very subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: isDarkMode
            ? 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};

export default ParallaxBackground; 