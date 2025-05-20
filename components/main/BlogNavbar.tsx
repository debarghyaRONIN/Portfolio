"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { slideInFromTop } from "@/utils/motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import gsap from "gsap";

const BlogNavbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setIsDarkMode(true);
    document.documentElement.classList.remove('light-mode');
  }, []);

  useEffect(() => {
    gsap.set(".blog-navbar-bg", {
      backgroundColor: "rgba(15, 15, 15, 0.95)",
      backdropFilter: "blur(8px)"
    });
  }, [isDarkMode]);

  return (
    <motion.div
      variants={slideInFromTop}
      initial="hidden"
      animate="visible"
      className="fixed w-full z-50"
    >
      <nav className="relative">
        <div className="blog-navbar-bg absolute inset-0 z-[-1]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 text-gray-200">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="inline-flex items-center space-x-2 text-sm md:text-base font-medium transition-all duration-300 transform hover:scale-105 text-gray-300 hover:text-white"
              >
                <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
                <span>Back to Portfolio</span>
              </a>
            </div>

            <div className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-300">
              <span className="whitespace-nowrap">ML Blogs</span>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .blog-navbar-bg {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
        @media (max-width: 768px) {
          .blog-navbar-bg {
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default BlogNavbar;
