"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  slideInFromLeft,
  slideInFromRight,
} from "@/utils/motion";
import Image from "next/image";

interface HeroContentProps {
  isDarkMode?: boolean;
}

const HeroContent = ({ isDarkMode = true }: HeroContentProps) => {
  // Only change the name gradient, keep other styles the same
  const headingGradient = isDarkMode 
    ? "from-red-800 to-yellow-400" 
    : "from-blue-600 to-blue-400";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex flex-row items-center justify-center px-4 sm:px-10 md:px-20 mt-20 md:mt-32 w-full z-[20]"
    >
      <div className="h-full w-full flex flex-col gap-5 justify-center m-auto text-start">
        <motion.div
          variants={slideInFromLeft(0.5)}
          className="welcome-box py-[8px] px-[10px] border border-[#7042f88b] opacity-[0.9] max-w-[290px]"
        >
          <h1 className="text-[14px] text-[#b49bff]">Machine Learning Engineer</h1>
        </motion.div>

        <motion.div
          variants={slideInFromLeft(0.5)}
          className="flex flex-col gap-6 mt-4 text-5xl sm:text-6xl font-bold text-white max-w-[600px] w-auto h-auto"
        >
          <span>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${headingGradient} transition-colors duration-500`}>
              Debarghya Saha
            </span>
          </span>
        </motion.div>

        <motion.div
          variants={slideInFromLeft(0.8)}
          className="text-base sm:text-lg text-gray-300 my-5 max-w-[600px] text-left"
        >
          Data Science & MLOps Specialist crafting intelligent solutions that transform data into impact. Building enterprise-ready AI applications with a focus on scalability and performance.
        </motion.div>
        
        <motion.div 
          variants={slideInFromLeft(1)}
          className="flex flex-row gap-5"
        >
          <motion.a
            variants={slideInFromLeft(1)}
            href="#about"
            className="py-2 px-4 button-primary text-center text-white cursor-pointer rounded-lg max-w-[200px] hover:bg-gradient-to-r hover:from-red-700 hover:to-yellow-500 transition-all duration-300"
          >
            Learn More
          </motion.a>
          
          <motion.a
            variants={slideInFromLeft(1.1)}
            href="#contact"
            className="py-2 px-4 text-center border border-red-600 text-white cursor-pointer rounded-lg max-w-[200px] hover:bg-red-600/10 transition-all duration-300"
          >
            Contact Me
          </motion.a>
        </motion.div>
      </div>

      <motion.div
        variants={slideInFromRight(0.8)}
        className="w-full h-full hidden md:flex justify-center items-center"
      >
        <Image
          src="/mainIconsdark.svg"
          alt="work icons"
          height={650}
          width={650}
        />
      </motion.div>
    </motion.div>
  );
};

export default HeroContent;