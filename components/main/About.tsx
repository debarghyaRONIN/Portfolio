"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { slideInFromLeft, slideInFromRight } from "@/utils/motion";
import Image from "next/image";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const About = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Listen for theme changes from the navbar
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
  const textClasses = isDarkMode ? "text-gray-300" : "text-gray-700";
  const headingGradient = isDarkMode 
    ? "from-red-600 to-yellow-500" 
    : "from-blue-600 to-blue-400";
  
  const primaryButtonGradient = isDarkMode
    ? "from-red-600 to-yellow-500 hover:from-yellow-500 hover:to-red-600"
    : "from-blue-600 to-blue-400 hover:from-blue-400 hover:to-blue-600";
  
  const secondaryButtonClasses = isDarkMode
    ? "border-red-600 text-red-400 hover:bg-red-600/10"
    : "border-blue-600 text-blue-500 hover:bg-blue-600/10";
  
  const accentButtonGradient = isDarkMode
    ? "from-orange-500 to-yellow-500 hover:from-yellow-500 hover:to-orange-500"
    : "from-blue-500 to-blue-300 hover:from-blue-300 hover:to-blue-500";
  
  const socialIconClasses = isDarkMode
    ? "text-gray-400 hover:text-white"
    : "text-gray-500 hover:text-blue-600";
  
  const overlayGradient = isDarkMode
    ? "bg-gradient-to-t from-black/50 to-transparent"
    : "bg-gradient-to-t from-black/40 to-transparent";

  return (
    <div className={`relative flex flex-col h-full w-full transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-gray-100'}`} id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row items-center justify-between gap-10"
        >
          {/* Image Section */}
          <motion.div
            variants={slideInFromLeft(0.5)}
            className="w-full md:w-1/2 flex justify-center"
          >
            <div className="relative w-[300px] h-[450px] rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
              <Image
                src="/DebarghyaProfile.jpg"
                alt="Debarghya"
                fill
                className="object-cover"
                priority
              />
              <div className={`absolute inset-0 ${overlayGradient}`}></div>
            </div>
          </motion.div>

          {/* Text Section */}
          <motion.div
            variants={slideInFromRight(0.5)}
            className="w-full md:w-1/2 space-y-6"
          >
            <h2 className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${headingGradient} transition-colors duration-500`}>
              About Me
            </h2>
            <div className={`space-y-4 ${textClasses} transition-colors duration-500`}>
              <p className="text-lg leading-relaxed">
              A Data Science & MLOps Engineer with a strong background in Data Science, AI model development, and data engineering.
              </p>
              <p className="text-lg leading-relaxed">
              I have experience working with machine learning frameworks, MLOps pipelines, and AI-driven applications. My projects involve building intelligent systems, optimizing workflows, and deploying scalable solutions. I also have a solid understanding of computer networks, backend development, and software architecture.
              </p>
              <p className="text-lg leading-relaxed">
                In my free time, i sometimes make 3d Art too (I was a 3d Artist Freelancer till 2nd Year of my college)
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <a
                href="#skills"
                className={`px-6 py-3 bg-gradient-to-r ${primaryButtonGradient} text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105`}
              >
                View Skills
              </a>
              <a
                href="#projects"
                className={`px-6 py-3 border ${secondaryButtonClasses} rounded-lg font-medium transition-all duration-300 transform hover:scale-105`}
              >
                View Projects
              </a>
              <a
                href="/Debarghya_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-3 bg-gradient-to-r ${accentButtonGradient} text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105`}
              >
                Resume
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/debarghya-saha-99baa624a/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${socialIconClasses} transition-colors duration-300`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=debarghyasren@gmail.com&su=Portfolio%20Inquiry&body=Hello%20Debarghya%2C"
                target="_blank"
                rel="noopener noreferrer"
                className={`${socialIconClasses} transition-colors duration-300`}
              >
                <EnvelopeIcon className="w-6 h-6" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 