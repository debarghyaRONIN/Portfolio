"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

const FloatingActionButton = () => {
  const [showFAB, setShowFAB] = useState(false);
  const [showActions, setShowActions] = useState(false);
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

  // Show FAB after 500px scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowFAB(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Define navigation sections
  const navigationSections = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "achievements", label: "Timeline" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      <AnimatePresence>
        {showFAB && (
          <motion.div 
            className="fixed z-50 bottom-8 right-6 flex flex-col items-end"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            {/* Quick Access Navigation */}
            <AnimatePresence>
              {showActions && (
                <motion.div 
                  className="flex flex-col gap-2 mb-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {navigationSections.map((section, index) => (
                    <motion.a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`${
                        isDarkMode 
                          ? 'bg-[#1C1C1C]/90 hover:bg-red-800/20 text-white' 
                          : 'bg-white/90 hover:bg-blue-500/20 text-gray-800'
                      } backdrop-blur-md w-24 text-center py-2 rounded-full text-sm shadow-lg transition-all`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setShowActions(false)}
                    >
                      {section.label}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Main FAB */}
            <motion.button
              className={`${
                isDarkMode 
                  ? (showActions 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gradient-to-r from-red-600 to-yellow-500 text-white')
                  : (showActions 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-400 text-white')
              } w-12 h-12 rounded-full shadow-lg flex items-center justify-center`}
              onClick={() => setShowActions(!showActions)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                animate={{ rotate: showActions ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowUpIcon className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingActionButton; 