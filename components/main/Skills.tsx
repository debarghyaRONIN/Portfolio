"use client";

import {
    Backend_skill,
    Frontend_skill,
    Skill_data,
    ML_AI_Skills,
    Skill
} from "@/constants";
import React from "react";
import SkillDataProvider from "../sub/SkillDataProvider";
import SkillText from "../sub/SkillText";
import { motion } from "framer-motion";

const Skills = () => {
    return (
        <section
            id="skills"
            className="flex flex-col items-center justify-center gap-3 h-full relative overflow-hidden py-20"
            style={{ transform: "scale(0.9)" }}
        >
            {/* Video Background with Color Spread */}
            <div className="absolute inset-0 w-[150%] h-full overflow-hidden z-[1]">
                <video
                    autoPlay
                    muted
                    loop
                    className="absolute w-full h-full object-cover"
                >
                    <source src="/bonfire_dark.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black/60"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-500/20 to-yellow-500/20 mix-blend-overlay"></div>
            </div>

            {/* Content Layer */}
            <div className="relative z-[2] w-full max-w-7xl mx-auto px-4">
                <SkillText />

                <div className="flex flex-col items-center gap-8 mt-8">
                    {/* Main Skills */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {Skill_data.map((image: Skill, index: number) => (
                            <SkillDataProvider
                                key={index}
                                src={image.Image}
                                width={image.width}
                                height={image.height}
                                index={index}
                            />
                        ))}
                    </div>

                    {/* Frontend Skills */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {Frontend_skill.map((image: Skill, index: number) => (
                            <SkillDataProvider
                                key={index}
                                src={image.Image}
                                width={image.width}
                                height={image.height}
                                index={index}
                            />
                        ))}
                    </div>
                    
                    {/* ML/AI Skills */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {ML_AI_Skills.map((image: Skill, index: number) => (
                            <SkillDataProvider
                                key={index}
                                src={image.Image}
                                width={image.width}
                                height={image.height}
                                index={index}
                            />
                        ))}
                    </div>
                    
                    {/* Backend Skills */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {Backend_skill.map((image: Skill, index: number) => (
                            <SkillDataProvider
                                key={index}
                                src={image.Image}
                                width={image.width}
                                height={image.height}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Skills;