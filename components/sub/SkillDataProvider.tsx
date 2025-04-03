"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image';

interface SkillDataProviderProps {
    src: string;
    width: number;
    height: number;
    index: number;
    isDarkMode?: boolean;
}

const SkillDataProvider = ({ src, width, height, index, isDarkMode = true} : SkillDataProviderProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const {ref, inView} = useInView({
        triggerOnce: true,
        threshold: 0.2
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Enhanced animation variants
    const imageVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.8,
            rotate: isDarkMode ? -10 : 10,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: index * 0.1, // shorter delay for more fluid appearance
                duration: 0.6
            }
        },
        hover: {
            scale: 1.2,
            rotate: isDarkMode ? 5 : -5,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: {
            scale: 0.9,
            transition: {
                duration: 0.1
            }
        }
    };
    
    const wrapperClasses = isDarkMode 
        ? "" 
        : "filter brightness-[0.85] contrast-[1.2]";
    
    return (
        <motion.div
            ref={ref}
            initial={isMounted ? "hidden" : false}
            variants={imageVariants}
            animate={inView && isMounted ? "visible" : "hidden"}
            whileHover={isMounted ? "hover" : undefined}
            whileTap={isMounted ? "tap" : undefined}
            className={`${wrapperClasses} transition-all duration-500 skill-icon p-2`}
        >
            <Image
                src={src}
                width={width}
                height={height}
                alt='skill image'
                className="transition-transform duration-300"
            />
        </motion.div>
    )
}

export default SkillDataProvider