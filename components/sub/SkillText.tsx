"use client"
import React from 'react'

interface SkillTextProps {
  isDarkMode?: boolean;
}

const SkillText = ({ isDarkMode = true }: SkillTextProps) => {
  const textClasses = isDarkMode ? "text-gray-300" : "text-gray-700";
  const headingGradient = isDarkMode
    ? "from-red-600 to-yellow-500"
    : "from-blue-600 to-blue-400";

  return (
    <div className='w-full h-auto flex flex-col gap-5 items-center justify-center'>
      
      <div
        className={`text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${headingGradient} transition-colors duration-500`}
      >
        Technical Expertise
      </div>
      
      <div
        className={`${textClasses} text-center text-xl max-w-3xl transition-colors duration-500`}
      >
        I&apos;ve worked with a range of technologies in the machine learning and web development world.
        From backend rule-based implementations to generative artificial intelligence.
      </div>
    </div>
  )
}

export default SkillText