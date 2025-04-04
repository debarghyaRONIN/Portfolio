"use client";

import {
    Backend_skill,
    Frontend_skill,
    Skill_data,
    ML_AI_Skills,
    Skill
} from "@/constants";
import React, { useState, useEffect } from "react";
import { animateSkills } from "@/utils/gsapAnimations";
import SkillDataProvider from "../sub/SkillDataProvider";
import SkillText from "../sub/SkillText";
import { motion } from "framer-motion";
import { staggerContainer, fadeIn, cardVariants } from "@/utils/framerAnimations";

const Skills = () => {
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

    // Initialize GSAP animations
    useEffect(() => {
        animateSkills();
    }, []);

    // Dynamic classes based on theme
    const bgClasses = isDarkMode 
        ? "bg-[#0A0A0A]" 
        : "bg-gray-100";
    
    const gradientClasses = isDarkMode
        ? "bg-gradient-to-r from-red-600/10 via-orange-500/10 to-yellow-500/10"
        : "bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-400/10";
    
    const cardBgClasses = isDarkMode
        ? "bg-black/30 border-gray-800"
        : "bg-white/80 border-gray-200";
    
    const titleClasses = isDarkMode
        ? "text-white"
        : "text-gray-800";
        
    // Staggered animation for the skill cards
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    return (
        <motion.section
            id="skills"
            className="flex flex-col items-center justify-center gap-3 h-full relative overflow-hidden py-20 transition-colors duration-500"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
        >
            {/* Background with gradient */}
            <div className="absolute inset-0 w-full h-full z-[-1]">
                <div className={`absolute inset-0 transition-colors duration-500 ${bgClasses}`}></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                <motion.div 
                    className={`absolute inset-0 transition-colors duration-500 ${gradientClasses}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                ></motion.div>
            </div>

            {/* Content Layer */}
            <div className="relative z-[2] w-full max-w-7xl mx-auto px-4">
                <motion.div 
                    className="skill-header"
                    variants={fadeIn}
                >
                    <SkillText isDarkMode={isDarkMode} />
                </motion.div>

                <motion.div 
                    className="flex flex-col items-center gap-12 mt-12"
                    variants={staggerContainer}
                >
                    {/* Skill Categories */}
                    <motion.div 
                        className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        variants={containerVariants}
                    >
                        {/* Main Skills */}
                        <motion.div 
                            className={`skill-card backdrop-blur-sm p-6 rounded-lg card-hover transition-colors duration-500 ${cardBgClasses}`}
                            variants={cardVariants}
                            whileHover={{
                                y: -10,
                                boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
                                transition: { duration: 0.3, ease: "easeOut" }
                            }}
                        >
                            <motion.h3 
                                className={`text-xl font-semibold mb-4 text-center transition-colors duration-500 ${titleClasses}`}
                                variants={fadeIn}
                            >
                                Core Technologies
                            </motion.h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {Skill_data.map((image: Skill, index: number) => (
                                    <SkillDataProvider
                                        key={index}
                                        src={image.Image}
                                        width={image.width}
                                        height={image.height}
                                        index={index}
                                        isDarkMode={isDarkMode}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Frontend Skills */}
                        <motion.div 
                            className={`skill-card backdrop-blur-sm p-6 rounded-lg card-hover transition-colors duration-500 ${cardBgClasses}`}
                            variants={cardVariants}
                            whileHover={{
                                y: -10,
                                boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
                                transition: { duration: 0.3, ease: "easeOut" }
                            }}
                        >
                            <motion.h3 
                                className={`text-xl font-semibold mb-4 text-center transition-colors duration-500 ${titleClasses}`}
                                variants={fadeIn}
                            >
                                Frontend
                            </motion.h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {Frontend_skill.map((image: Skill, index: number) => (
                                    <SkillDataProvider
                                        key={index}
                                        src={image.Image}
                                        width={image.width}
                                        height={image.height}
                                        index={index}
                                        isDarkMode={isDarkMode}
                                    />
                                ))}
                            </div>
                        </motion.div>
                        
                        {/* ML/AI Skills */}
                        <motion.div 
                            className={`skill-card backdrop-blur-sm p-6 rounded-lg card-hover transition-colors duration-500 ${cardBgClasses}`}
                            variants={cardVariants}
                            whileHover={{
                                y: -10,
                                boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
                                transition: { duration: 0.3, ease: "easeOut" }
                            }}
                        >
                            <motion.h3 
                                className={`text-xl font-semibold mb-4 text-center transition-colors duration-500 ${titleClasses}`}
                                variants={fadeIn}
                            >
                                ML/AI
                            </motion.h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {ML_AI_Skills.map((image: Skill, index: number) => (
                                    <SkillDataProvider
                                        key={index}
                                        src={image.Image}
                                        width={image.width}
                                        height={image.height}
                                        index={index}
                                        isDarkMode={isDarkMode}
                                    />
                                ))}
                            </div>
                        </motion.div>
                        
                        {/* Backend Skills */}
                        <motion.div 
                            className={`skill-card backdrop-blur-sm p-6 rounded-lg card-hover transition-colors duration-500 ${cardBgClasses}`}
                            variants={cardVariants}
                            whileHover={{
                                y: -10,
                                boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
                                transition: { duration: 0.3, ease: "easeOut" }
                            }}
                        >
                            <motion.h3 
                                className={`text-xl font-semibold mb-4 text-center transition-colors duration-500 ${titleClasses}`}
                                variants={fadeIn}
                            >
                                Backend
                            </motion.h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {Backend_skill.map((image: Skill, index: number) => (
                                    <SkillDataProvider
                                        key={index}
                                        src={image.Image}
                                        width={image.width}
                                        height={image.height}
                                        index={index}
                                        isDarkMode={isDarkMode}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default Skills;