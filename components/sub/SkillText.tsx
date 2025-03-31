"use client"
import React from 'react'
import {motion} from 'framer-motion'
import { slideInFromLeft } from '@/utils/motion'

const SkillText = () => {
  return (
    <div className='w-full h-auto flex flex-col items-center justify-center mb-10'>
      <motion.div
        variants={slideInFromLeft(0.5)}
        className='text-4xl font-bold text-center mb-[15px]'
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">
          Skills
        </span>
      </motion.div>
    </div>
  )
}

export default SkillText