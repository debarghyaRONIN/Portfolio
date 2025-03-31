"use client";

import React from "react";
import { motion } from "framer-motion";
import { slideInFromLeft, slideInFromRight } from "@/utils/motion";
import Image from "next/image";

const Projects = () => {
  const projects = [
    {
      title: "Stock Market Prediction using Prophet",
      description: "A web app that predicts stock prices using Prophet. \n \n Features: \n -Uses Prophet for time series forecasting. \n -Streamlit for creating the web interface. \n -Yahoo Finance for fetching stock data.",
      image: "/Stock.png",
      technologies: ["Python", "Streamlit", "Prophet", "Yahoo Finance"],
      link: "https://pdftojso-vnksozoesenyxp8oqj9di5.streamlit.app/"
    },
    {
      title: "Reinforcement Learning to train AI to play Pokémon Red",
      description: "This project applies Reinforcement Learning (RL) to the classic Pokémon Red game using emulation and AI agents. The goal is to train an AI to play the game effectively by learning through trial and error.\n\nFeatures:\n• Uses Reinforcement Learning techniques (Q-Learning, DQN, or PPO).\n• Direct interaction with the Pokémon Red ROM through an emulator.\n• State representation based on in-game variables (HP, position, battle state, etc.).\n• Training AI to make optimal decisions in battles, movement, and objectives.\n• Python-based environment wrapper for controlled interactions.",
      image: "/red.jpg",
      technologies: ["Python", "Stable-baselines", "Gymnasium", "Wandb"],
      link: "https://github.com/debarghyaRONIN/Pokemon_Red-Reinforcement-Learning"
    },
    
  ];

  return (
    <div className="relative flex flex-col h-full w-full" id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-10"
        >
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500 text-center">
            Projects
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                variants={index % 2 === 0 ? slideInFromLeft(0.5) : slideInFromRight(0.5)}
                className="bg-black/60 rounded-xl overflow-hidden border border-[#ff6a0066] shadow-lg backdrop-filter backdrop-blur-sm"
              >
                {project.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">{project.title}</h3>
                  <p className="text-gray-300 whitespace-pre-line mb-4">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-gradient-to-r from-red-600/20 to-yellow-500/20 text-red-400 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg font-medium hover:from-yellow-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
                  >
                    View Project
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Projects;