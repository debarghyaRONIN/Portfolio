"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Props {
  src: string;
  title: string;
  description: string;
  link: string;
}

const ProjectCard = ({ src, title, description, link }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
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

  // 3D hover effect handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Limit the rotation to a subtle effect (between -5 and 5 degrees)
    const rotateY = ((x - centerX) / centerX) * 4;
    const rotateX = ((centerY - y) / centerY) * 4;
    
    // Apply the transform
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };
  
  // Reset transform on mouse leave
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    
    // Smoothly transition back to the original state
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-lg shadow-lg border 
        ${isDarkMode 
          ? 'border-[#333333] hover:border-[#444444]' 
          : 'border-gray-200 hover:border-gray-300'} 
        group transition-all duration-300 ease-out`}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out' }}
    >
      <div 
        className={`absolute inset-0 z-10 bg-gradient-to-t 
          ${isDarkMode 
            ? 'from-black/80 via-black/40 to-transparent' 
            : 'from-white/80 via-white/40 to-transparent'}
          transition-opacity duration-300 ${isHovered ? 'opacity-90' : 'opacity-70'}`}
      />
      
      <Image
        src={src}
        alt={title}
        width={1000}
        height={1000}
        className={`w-full h-64 object-cover object-center transition-transform duration-700 ease-out 
          ${isHovered ? 'scale-110' : 'scale-100'}`}
      />

      <div className="relative z-20 p-4 md:p-6">
        <h1 className={`text-xl md:text-2xl font-semibold mb-2 
          ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h1>
        <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          {description}
        </p>
        
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block py-2 px-4 rounded-md transition-all duration-300 font-medium text-sm
            ${isDarkMode 
              ? 'bg-gradient-to-r from-red-600 to-yellow-500 hover:brightness-110 text-white' 
              : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:brightness-110 text-white'}`}
        >
          View Project
        </a>
        
        {/* Shine effect overlay */}
        <div 
          className={`absolute inset-0 -z-10 pointer-events-none bg-gradient-to-tr 
            ${isDarkMode 
              ? 'from-transparent via-white/5 to-transparent' 
              : 'from-transparent via-white/40 to-transparent'}
            opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out`}
          style={{
            backgroundSize: '200% 200%', 
            backgroundPosition: isHovered ? 'right bottom' : 'left top',
            transition: 'background-position 0.7s ease-in-out'
          }}
        />
      </div>
    </div>
  );
};

export default ProjectCard;