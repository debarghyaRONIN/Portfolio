"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { animateHero } from "@/utils/gsapAnimations";
import Image from "next/image";
import { gsap } from "gsap";
import { slideInFromTop, fadeIn, staggerContainer, slideIn } from "@/utils/motion";

interface HeroContentProps {
  isDarkMode?: boolean;
}

const HeroContent = ({ isDarkMode = true }: HeroContentProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = animateHero();
    
    return () => {
      tl.kill();
    };
  }, []);

  // Mouse tracking for 3D tilt effect
  useEffect(() => {
    const heroImage = imageRef.current;
    const glareElement = glareRef.current;
    if (!heroImage || !glareElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!heroImage) return;
      
      // Get the dimensions and position of the image container
      const { left, top, width, height } = heroImage.getBoundingClientRect();
      
      // Calculate mouse position relative to the center of the image
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      // Calculate distance from center as percentage (-1 to 1)
      const percentX = (e.clientX - centerX) / (width / 2);
      const percentY = (e.clientY - centerY) / (height / 2);
      
      // Calculate mouse position relative to element (0 to 100%)
      const relativeX = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
      const relativeY = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
      
      // Apply rotation to the image (max 15 degrees)
      const rotateY = -percentX * 15;
      const rotateX = percentY * 15;
      
      // Apply 3D transform with GSAP (smoother than CSS)
      gsap.to(heroImage, {
        rotateY: rotateY,
        rotateX: rotateX,
        perspective: 1000,
        ease: "power2.out",
        duration: 0.5,
        transformStyle: "preserve-3d"
      });

      // Add subtle movement to the image
      gsap.to(heroImage.querySelector('img'), {
        x: percentX * 30, 
        y: percentY * 30,
        ease: "power2.out",
        duration: 0.5
      });
      
      // Update the glare position
      if (glareElement) {
        gsap.to(glareElement, {
          opacity: 0.7,
          background: `radial-gradient(circle at ${relativeX}% ${relativeY}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 60%)`,
          duration: 0.3
        });
      }
    };

    const handleMouseLeave = () => {
      // Reset to default position when mouse leaves
      gsap.to(heroImage, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: "power3.out"
      });
      
      gsap.to(heroImage.querySelector('img'), {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      });
      
      // Hide the glare
      if (glareElement) {
        gsap.to(glareElement, {
          opacity: 0,
          duration: 0.3
        });
      }
    };

    // Add shadow effect on hover
    heroImage.addEventListener('mouseenter', () => {
      gsap.to(heroImage, {
        boxShadow: isDarkMode 
          ? "0 25px 50px rgba(255, 100, 0, 0.2), 0 0 30px rgba(255, 100, 0, 0.15)" 
          : "0 25px 50px rgba(0, 100, 255, 0.2), 0 0 30px rgba(0, 100, 255, 0.15)",
        scale: 1.03,
        duration: 0.4
      });
    });

    heroImage.addEventListener('mouseleave', () => {
      gsap.to(heroImage, {
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        scale: 1,
        duration: 0.4
      });
    });

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    heroImage.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      heroImage.removeEventListener("mouseleave", handleMouseLeave);
      heroImage.removeEventListener('mouseenter', () => {});
      heroImage.removeEventListener('mouseleave', () => {});
    };
  }, [isDarkMode]);

  // Only change the name gradient, keep other styles the same
  const headingGradient = isDarkMode 
    ? "from-red-800 to-yellow-400" 
    : "from-blue-600 to-blue-400";
    
  // Remove the split text animation
  // const nameText = "Debarghya Saha";
  // const nameLetters = nameText.split("");

  return (
    <motion.div
      ref={heroRef}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-row items-center justify-center px-4 sm:px-10 md:px-20 mt-20 md:mt-32 w-full z-[20]"
    >
      <motion.div 
        className="h-full w-full flex flex-col gap-5 justify-center m-auto text-start"
      >
        <motion.div
          variants={slideIn("down", 0.1)}
          className="hero-welcome-box welcome-box py-[8px] px-[10px] border border-[#7042f88b] opacity-[0.9] max-w-[290px]"
        >
          <motion.h1 
            className="text-[14px] text-[#b49bff]"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 0.2, duration: 0.5 }
            }}
          >
            Machine Learning Engineer
          </motion.h1>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="hero-name flex flex-col gap-6 mt-4 text-5xl sm:text-6xl font-bold text-white max-w-[600px] w-auto h-auto"
        >
          {/* Replace character animation with simple gradient text */}
          <motion.h1 
            className={`text-transparent bg-clip-text bg-gradient-to-r ${headingGradient} transition-colors duration-500 leading-normal py-2`}
          >
            Debarghya Saha
          </motion.h1>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="hero-description text-base sm:text-lg text-gray-300 my-5 max-w-[600px] text-left"
        >
          Data Science & MLOps Specialist crafting intelligent solutions that transform data into impact. Building enterprise-ready AI applications with a focus on scalability and performance.
        </motion.div>
        
        <motion.div 
          variants={slideIn("up", 0.4)}
          className="hero-buttons flex flex-row gap-5"
        >
          <motion.a
            href="#about"
            className="py-2 px-4 button button-primary text-center text-white cursor-pointer rounded-lg max-w-[200px] hover:bg-gradient-to-r hover:from-red-700 hover:to-yellow-500 transition-all duration-300"
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: "0 10px 25px rgba(255, 100, 0, 0.3)",
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.a>
          
          <motion.a
            href="#contact"
            className="py-2 px-4 button text-center border border-red-600 text-white cursor-pointer rounded-lg max-w-[200px] hover:bg-red-600/10 transition-all duration-300"
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: "0 10px 25px rgba(255, 100, 0, 0.2)",
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Me
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div
        ref={imageRef}
        variants={slideIn("right", 0.3)}
        className="hero-image w-full h-full hidden md:flex justify-center items-center perspective-container rounded-xl p-4 transition-all duration-500 overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          position: 'relative'
        }}
      >
        {/* Glare overlay */}
        <div 
          ref={glareRef} 
          className="absolute inset-0 z-10 pointer-events-none opacity-0"
          style={{ 
            borderRadius: 'inherit',
            mixBlendMode: 'overlay'
          }}
        ></div>
        
        {/* Card edge highlight */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, rgba(255,100,0,0.05) 0%, transparent 50%, rgba(255,100,0,0.05) 100%)' 
              : 'linear-gradient(135deg, rgba(0,100,255,0.05) 0%, transparent 50%, rgba(0,100,255,0.05) 100%)',
            borderRadius: 'inherit'
          }}
        ></div>
        
        <Image
          src="/mainIconsdark.svg"
          alt="work icons"
          height={650}
          width={650}
          className="transform-gpu transition-transform duration-300 relative z-1"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(40px)'
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default HeroContent;