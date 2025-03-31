"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { slideInFromLeft, slideInFromRight } from "@/utils/motion";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
  images: string[];
  isLeft: boolean;
  isDarkMode: boolean;
}

const TimelineItem = ({ year, title, description, images, isLeft, isDarkMode }: TimelineItemProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to determine if current image is portrait
  const isPortraitImage = () => {
    // Check if the current image is the portrait one
    return images[currentImageIndex] === "/Sih2024me_with_trophy.jpeg";
  };

  const goToPrevImage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentImageIndex]);

  // Dynamic classes based on theme
  const cardBgClass = isDarkMode 
    ? "bg-[#1C1C1C]/60" 
    : "bg-white/80";
  
  const cardBorderClass = isDarkMode 
    ? "border-[#ff6a0066]" 
    : "border-blue-400/40";
  
  const headingGradient = isDarkMode 
    ? "from-red-600 to-yellow-500" 
    : "from-blue-600 to-blue-400";
  
  // For the title, use white text in both modes
  const titleClass = "text-white";
    
  const descriptionClass = isDarkMode ? "text-gray-300" : "text-gray-700";
  
  const timelineGradient = isDarkMode
    ? "from-red-600 via-orange-500 to-yellow-500"
    : "from-blue-600 via-blue-500 to-blue-400";
  
  const reverseTimelineGradient = isDarkMode
    ? "from-yellow-500 via-orange-500 to-red-600"
    : "from-blue-400 via-blue-500 to-blue-600";
  
  const dotGradient = isDarkMode
    ? "from-red-600 via-orange-500 to-yellow-500 shadow-orange-500/30"
    : "from-blue-600 via-blue-500 to-blue-400 shadow-blue-500/30";

  return (
    <div className={`flex flex-col md:flex-row w-full items-center justify-center my-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      {/* Content side */}
      <motion.div 
        variants={isLeft ? slideInFromLeft(0.5) : slideInFromRight(0.5)}
        className="w-full md:w-1/2 p-4"
      >
        <div className={`${cardBgClass} p-6 rounded-lg border ${cardBorderClass} shadow-lg backdrop-filter backdrop-blur-sm transition-colors duration-500`}>
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${headingGradient} font-bold transition-colors duration-500`}>
            {year}
          </span>
          <h3 className={`text-xl font-bold ${titleClass} mt-2 transition-colors duration-500`}>{title}</h3>
          <p className={`${descriptionClass} mt-2 transition-colors duration-500`}>{description}</p>
        </div>
      </motion.div>
      
      {/* Center wire - hidden on mobile, shown on md and larger */}
      <div className="hidden md:flex mx-4 h-full flex-col items-center">
        <div className={`w-1 bg-gradient-to-b ${timelineGradient} h-full flex-grow transition-colors duration-500`}></div>
        <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${dotGradient} my-2 shadow-lg transition-colors duration-500`}></div>
        <div className={`w-1 bg-gradient-to-b ${reverseTimelineGradient} h-full flex-grow transition-colors duration-500`}></div>
      </div>
      
      {/* Mobile timeline connector - only shown on mobile */}
      <div className="md:hidden flex h-12 w-full items-center justify-center">
        <div className={`h-full w-1 bg-gradient-to-b ${timelineGradient} transition-colors duration-500`}></div>
      </div>
      
      {/* Image side with navigation buttons */}
      <motion.div 
        variants={isLeft ? slideInFromRight(0.5) : slideInFromLeft(0.5)}
        className="w-full md:w-1/2 p-4 relative"
      >
        <div ref={containerRef} className={`relative h-72 md:h-80 w-full rounded-xl border-2 ${cardBorderClass} shadow-lg overflow-hidden ${cardBgClass} backdrop-filter backdrop-blur-sm transition-colors duration-500`}>
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <Image
              key={currentImageIndex} 
              src={images[currentImageIndex]}
              alt={`${title} - image ${currentImageIndex + 1}`}
              fill
              style={{ objectFit: isPortraitImage() ? 'contain' : 'cover', backgroundColor: isPortraitImage() ? 'rgba(0,0,0,0.8)' : 'transparent' }}
              className="timeline-image"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          
          {/* Navigation buttons */}
          {images.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
              <button 
                onClick={goToPrevImage}
                disabled={isAnimating}
                className="bg-black/30 hover:bg-black/50 text-white rounded-full p-2 shadow-lg transition-all duration-300 pointer-events-auto focus:outline-none z-10 hover:scale-110 disabled:opacity-50"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
              
              <button 
                onClick={goToNextImage}
                disabled={isAnimating}
                className="bg-black/30 hover:bg-black/50 text-white rounded-full p-2 shadow-lg transition-all duration-300 pointer-events-auto focus:outline-none z-10 hover:scale-110 disabled:opacity-50"
                aria-label="Next image"
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Timeline = () => {
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

  // Dynamic classes based on theme
  const headingGradient = isDarkMode 
    ? "from-red-600 to-yellow-500" 
    : "from-blue-600 to-blue-400";
  
  const overlayClass = isDarkMode 
    ? "bg-black/50" 
    : "bg-black/30";

  const timelineData = [
    {
      year: "2024",
      title: "Smart India Hackathon,2024(Winner)",
      description: "For SIH 2024, Our team tackled Problem Statement #1742 from the Ministry of Education, focused on standardizing odd schools. As an MLOps & AI Developer, I built APIs and automation system for decision-making and integrated Generative AI for implementation planning. To ensure security, we implemented secure file transfer and explored bio-nano storage solutions.",
      images: ["/sih2024us.jpeg", "/TeamBengalTigersApex.jpeg", "/Sih2024me_with_trophy.jpeg"],
      isLeft: true,
    },
    {
      year: "2023",
      title: "Internal Smart India Hackathon,2023(Winner)",
      description: "In 2023, we set out to compete in the Smart India Hackathon (SIH) with high hopes. Our team worked hard, brainstorming ideas, refining our approach, and tackling the problem statement head-on and we won the college level hackathon. The problem was on disaster management.Our team made a WebApp Prototype that helps people to get information about disasters and how to survive in disasters. As a 3d artist I created simulation to educate people on how to survive in disasters. But despite our efforts, we couldn't make it to the final rounds. REASON - No team were shortlisted from the problem statement we selected.",
      images: ["/Sih2023.jpeg", "/Prize.jpeg"],
      isLeft: false,
    }
  ];

  return (
    <div className="relative flex flex-col h-full w-full" id="achievements">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          muted
          loop
          className="absolute w-full h-full object-cover"
        >
          <source src="/Waterfall.mp4" type="video/mp4" />
        </video>
        <div className={`absolute inset-0 ${overlayClass} transition-colors duration-500`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-10"
        >
          <h2 className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${headingGradient} text-center transition-colors duration-500`}>
            Achievements
          </h2>
          
          <div className="space-y-8">
            {timelineData.map((item, index) => (
              <TimelineItem key={index} {...item} isDarkMode={isDarkMode} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Timeline; 