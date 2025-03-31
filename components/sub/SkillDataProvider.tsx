"use client"

import React from 'react'
import {motion} from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image';

interface Props {
    src: string;
    width: number;
    height: number;
    index: number;
    isDarkMode?: boolean;
}

const SkillDataProvider = ({ src, width, height, index, isDarkMode = true} : Props) => {
    const {ref, inView} = useInView({
        triggerOnce: true
    })

    const imageVariants = {
        hidden: {opacity: 0},
        visible: {opacity: 1}
    }

    const animationDelay = 0.3
    
    const wrapperClasses = isDarkMode 
        ? "" 
        : "filter brightness-[0.85] contrast-[1.2]";
    
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            variants={imageVariants}
            animate={inView ? "visible" : "hidden"}
            custom={index}
            transition={{delay: index * animationDelay}}
            className={`${wrapperClasses} transition-all duration-500`}
        >
            <Image
                src={src}
                width={width}
                height={height}
                alt='skill image'
                className="transition-transform duration-300 hover:scale-110"
            />
        </motion.div>
    )
}

export default SkillDataProvider