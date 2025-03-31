"use client"
import React from 'react'
import {motion} from 'framer-motion'
import { slideInFromLeft, slideInFromRight, slideInFromTop } from '@/utils/motion'

interface SkillTextProps {
  isDarkMode?: boolean;
}

const SkillText = ({ isDarkMode = true }: SkillTextProps) => {
  const textClasses = isDarkMode ? "text-gray-300" : "text-gray-700";
  const accentTextClass = isDarkMode ? "text-red-500" : "text-blue-500";

  return (
    <div className='w-full h-auto flex flex-col items-center justify-center mb-10'>
      
      
      <motion.div
        variants={slideInFromLeft(0.5)}
        className='text-4xl font-bold text-center mb-[15px]'
      >
        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
          isDarkMode 
            ? "from-red-600 to-yellow-500" 
            : "from-blue-600 to-blue-400"
        }`}>
          Skills & Technologies
        </span>
      </motion.div>
      
      <motion.div
        variants={slideInFromRight(0.5)}
        className={`text-center ${textClasses} text-sm md:text-base max-w-[600px] mb-10 transition-colors duration-500`}
      >
        Specialized in building AI & ML systems with enterprise-grade scalability and performance.
        My technical toolkit spans the full development spectrum.
      </motion.div>
    </div>
  )
}

export default SkillText