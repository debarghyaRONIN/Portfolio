"use client";

import {
    Backend_skill,
    Frontend_skill,
    Skill_data,
    ML_AI_Skills,
    Skill
} from "@/constants";
import React, { useState, useEffect } from "react";
import SkillDataProvider from "../sub/SkillDataProvider";
import SkillText from "../sub/SkillText";

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

    return (
        <section
            id="skills"
            className="flex flex-col items-center justify-center gap-3 h-full relative overflow-hidden py-20 transition-colors duration-500"
        >
            {/* Background with gradient */}
            <div className="absolute inset-0 w-full h-full z-[1]">
                <div className={`absolute inset-0 transition-colors duration-500 ${bgClasses}`}></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                <div className={`absolute inset-0 transition-colors duration-500 ${gradientClasses}`}></div>
            </div>

            {/* Content Layer */}
            <div className="relative z-[2] w-full max-w-7xl mx-auto px-4">
                <SkillText isDarkMode={isDarkMode} />

                <div className="flex flex-col items-center gap-12 mt-12">
                    {/* Skill Categories */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Main Skills */}
                        <div className={`backdrop-blur-sm p-6 rounded-lg card-hover transition-colors duration-500 ${cardBgClasses}`}>
                            <h3 className={`text-xl font-semibold mb-4 text-center transition-colors duration-500 ${titleClasses}`}>Core Technologies</h3>
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
                        </div>

                        {/* Frontend Skills */}
                        <div className={`backdrop-blur-sm p-6 rounded-lg card-hover transition-colors duration-500 ${cardBgClasses}`}>
                            <h3 className={`text-xl font-semibold mb-4 text-center transition-colors duration-500 ${titleClasses}`}>Frontend</h3>
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
                        </div>
                        
                        {/* ML/AI Skills */}
                        <div className={`backdrop-blur-sm p-6 rounded-lg card-hover transition-colors duration-500 ${cardBgClasses}`}>
                            <h3 className={`text-xl font-semibold mb-4 text-center transition-colors duration-500 ${titleClasses}`}>ML/AI</h3>
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
                        </div>
                        
                        {/* Backend Skills */}
                        <div className={`backdrop-blur-sm p-6 rounded-lg card-hover transition-colors duration-500 ${cardBgClasses}`}>
                            <h3 className={`text-xl font-semibold mb-4 text-center transition-colors duration-500 ${titleClasses}`}>Backend</h3>
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
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Skills;