"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { slideInFromTop } from "@/utils/motion";
import { Bars3Icon, XMarkIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Debounce function to prevent multiple rapid clicks
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout as NodeJS.Timeout);
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolling, setIsScrolling] = useState(false);
  const toggleButtonRef = useRef(null);
  const previousScrollPosition = useRef(0);

  // Register the ScrollToPlugin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollToPlugin);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Don't update active section if we're in the middle of a programmatic scroll
      if (isScrolling) return;
      
      // Determine active section based on scroll position
      const sections = navItems.map(item => item.href.substring(1));
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection && currentSection !== activeSection) {
        // Use gsap.set instead of gsap.to to prevent animation glitches
        gsap.set(`.nav-item-${activeSection}`, {
          scale: 1,
          fontWeight: "normal"
        });
        
        setActiveSection(currentSection);
        
        // Use gsap.set for the new active section too
        gsap.set(`.nav-item-${currentSection}`, {
          scale: 1.05,
          fontWeight: "bold"
        });
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection, isScrolling]);

  // Theme toggle function
  const toggleTheme = () => {
    // First update the theme immediately
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Then update the DOM
    if (newMode) {
      document.documentElement.classList.remove('light-mode');
      // Update navbar color immediately
      gsap.set(".navbar-bg", {
        backgroundColor: "rgba(15, 15, 15, 0.95)",
        backdropFilter: "blur(8px)"
      });
    } else {
      document.documentElement.classList.add('light-mode');
      // Update navbar color immediately
      gsap.set(".navbar-bg", {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)"
      });
    }
    
    // Store user preference
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Check for saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const prefersDark = savedTheme === 'dark';
      setIsDarkMode(prefersDark);
      if (!prefersDark) {
        document.documentElement.classList.add('light-mode');
      }
    } else {
      // Check system preference if no saved preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (!prefersDark) {
        document.documentElement.classList.add('light-mode');
      }
    }
  }, []);

  // Update background color based on theme
  useEffect(() => {
    // Set the navbar background color based only on theme mode
    const bgColor = isDarkMode ? "rgba(15, 15, 15, 0.95)" : "rgba(255, 255, 255, 0.95)";
    gsap.set(".navbar-bg", {
      backgroundColor: bgColor,
      backdropFilter: "blur(8px)"
    });
  }, [isDarkMode]);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Experience", href: "#achievements" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  // Function to handle smooth scrolling to sections with debouncing
  const scrollToSection = useCallback(
    debounce((sectionId: string) => {
      setIsOpen(false); // Close mobile menu
      const targetSection = document.getElementById(sectionId);
      
      if (targetSection) {
        // Store the current scroll position before scrolling
        previousScrollPosition.current = window.scrollY;
        
        // Set scrolling state to prevent active section updates during animation
        setIsScrolling(true);
        
        try {
          // Update active menu item immediately for better UX
          setActiveSection(sectionId);
          
          // Don't animate the old button, only set the new one
          gsap.set(`.nav-item-${activeSection}`, {
            scale: 1,
            fontWeight: "normal"
          });
          
          gsap.set(`.nav-item-${sectionId}`, {
            scale: 1.05,
            fontWeight: "bold"
          });
          
          // Use GSAP for smooth scrolling animation if available
          gsap.to(window, {
            duration: 0.2, 
            scrollTo: {
              y: targetSection,
              offsetY: 70, // Account for navbar height
              autoKill: false,
            },
            ease: "none",
            onComplete: () => {
              setIsScrolling(false);
            }
          });
        } catch (error) {
          // Fallback to native smooth scrolling if GSAP ScrollToPlugin fails
          const yOffset = -70; // navbar height offset
          const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          
          // Use instant scroll
          window.scrollTo({
            top: y,
            behavior: 'auto'
          });
          
          setIsScrolling(false);
        }
      }
    }, 0),
    [activeSection]
  );

  // Email address for contact
  const emailAddress = "debarghyasren@gmail.com";
  const emailSubject = "Portfolio Contact";
  const emailBody = "Hello Debarghya,";
  const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <motion.div
      variants={slideInFromTop}
      initial="hidden"
      animate="visible"
      className={`fixed w-full z-50 ${
        isDarkMode ? '' : 'light-mode'
      }`}
    >
      {/* Navbar background - changes only with theme */}
      <div className="navbar-bg absolute inset-0 z-[-1]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => scrollToSection("home")}
              className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${
                isDarkMode 
                  ? "from-red-600 to-yellow-500 hover:from-yellow-500 hover:to-red-600" 
                  : "from-blue-600 to-blue-400 hover:from-blue-400 hover:to-blue-600"
              } transform hover:scale-105`}
            >
              <span className="mr-2 text-3xl font-extrabold">DS</span>
            </button>
            
            {/* Theme toggle button */}
            <div className="relative z-10">
              <button 
                ref={toggleButtonRef}
                onClick={toggleTheme}
                className="p-2 rounded-full focus:outline-none hover:scale-110"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300 filter drop-shadow-glow" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 filter drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href.substring(1))}
                className={`
                  relative px-3 py-2 rounded-md text-sm font-medium 
                  transform hover:scale-[1.05]
                  nav-item-${item.href.substring(1)}
                  ${activeSection === item.href.substring(1)
                    ? isDarkMode 
                      ? 'text-white'
                      : 'text-black'
                    : isDarkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-black'
                  }
                `}
              >
                {item.name}
                <span 
                  className={`
                    absolute bottom-0 left-0 w-full h-0.5 rounded-full transform origin-left
                    ${activeSection === item.href.substring(1)
                      ? isDarkMode 
                        ? 'bg-gradient-to-r from-red-600 to-yellow-500 scale-x-100'
                        : 'bg-gradient-to-r from-blue-600 to-blue-400 scale-x-100'
                      : 'bg-gray-500 scale-x-0 group-hover:scale-x-100'
                    }
                  `}
                />
                <span 
                  className={`
                    absolute inset-0 rounded-md -z-10 opacity-20
                    ${activeSection === item.href.substring(1)
                      ? isDarkMode 
                        ? 'bg-gradient-to-r from-red-600/30 to-yellow-500/30 opacity-100'
                        : 'bg-gradient-to-r from-blue-500/30 to-blue-300/30 opacity-100'
                      : isDarkMode 
                        ? 'hover:bg-gradient-to-r hover:from-red-600/20 hover:to-yellow-500/20 opacity-0 hover:opacity-100' 
                        : 'hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-300/20 opacity-0 hover:opacity-100'
                    }
                  `}
                />
              </button>
            ))}
            
            {/* Desktop Contact Icons */}
            <div className="flex items-center space-x-2 ml-2 border-l pl-2 border-gray-700">
              <a
                href="https://github.com/debarghyaRONIN"
                target="_blank"
                rel="noopener noreferrer"
                className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} p-1 rounded-full hover:bg-gray-800/30`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/debarghya-saha-99baa624a/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} p-1 rounded-full hover:bg-gray-800/30`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-.88-.06-1.601-1-1.601-1 0-1.16.781-1.16 1.601v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href={mailtoLink}
                className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
              >
                <EnvelopeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="block md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { 
            opacity: 1, 
            height: "auto"
          },
          closed: { 
            opacity: 0, 
            height: 0
          },
        }}
        className={`${isDarkMode ? 'bg-[#0f0f0f]/95' : 'bg-gray-50/95'} backdrop-blur-md overflow-hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => scrollToSection(item.href.substring(1))}
              className={`
                nav-item-${item.href.substring(1)}
                ${activeSection === item.href.substring(1)
                  ? isDarkMode 
                    ? 'bg-gradient-to-r from-red-600/30 to-yellow-500/30 text-white'
                    : 'bg-gradient-to-r from-blue-500/30 to-blue-300/30 text-black'
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-yellow-500/20' 
                    : 'text-gray-700 hover:text-black hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-300/20'
                } 
                block px-3 py-2 rounded-md text-base font-medium w-full text-left`}
            >
              {item.name}
            </motion.button>
          ))}
          {/* Mobile Contact Icons */}
          <div className={`flex items-center space-x-4 px-3 py-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} mt-2 pt-2`}>
            <a
              href="https://github.com/debarghyaRONIN"
              target="_blank"
              rel="noopener noreferrer"
              className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/debarghya-saha-99baa624a/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-.88-.06-1.601-1-1.601-1 0-1.16.781-1.16 1.601v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href={mailtoLink}
              className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
            >
              <EnvelopeIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* CSS for effects */}
      <style jsx>{`
        .filter.drop-shadow-glow {
          filter: drop-shadow(0 0 3px rgba(252, 211, 77, 0.5));
        }
        
        .light-mode .navbar-bg {
          background-color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </motion.div>
  );
};

export default Navbar;