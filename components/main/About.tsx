"use client";

import React from "react";
import { motion } from "framer-motion";
import { slideInFromLeft, slideInFromRight } from "@/utils/motion";
import Image from "next/image";

const About = () => {
  return (
    <div className="relative flex flex-col h-full w-full" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row items-center justify-between gap-10"
        >
          {/* Image Section */}
          <motion.div
            variants={slideInFromLeft(0.5)}
            className="w-full md:w-1/2 flex justify-center"
          >
            <div className="relative w-[300px] h-[450px] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/DebarghyaProfile.jpg"
                alt="Debarghya"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </motion.div>

          {/* Text Section */}
          <motion.div
            variants={slideInFromRight(0.5)}
            className="w-full md:w-1/2 space-y-6"
          >
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">
              About Me
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg leading-relaxed">
                I am a passionate Machine Learning Engineer and MLOps enthusiast with a strong foundation in AI and data science. My journey in technology has been driven by a deep curiosity for solving complex problems and creating innovative solutions.
              </p>
              <p className="text-lg leading-relaxed">
                With expertise in both traditional machine learning and cutting-edge AI technologies, I specialize in building scalable AI-driven solutions that make a real impact. My experience spans from developing rule-based automation systems to implementing state-of-the-art generative AI models.
              </p>
              <p className="text-lg leading-relaxed">
                When I'm not coding, I'm constantly exploring new technologies and contributing to the AI community. I believe in the power of continuous learning and sharing knowledge to drive innovation forward.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <a
                href="#skills"
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg font-medium hover:from-yellow-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
              >
                View Skills
              </a>
              <a
                href="#projects"
                className="px-6 py-3 border border-red-600 text-red-400 rounded-lg font-medium hover:bg-red-600/10 transition-all duration-300 transform hover:scale-105"
              >
                View Projects
              </a>
              <a
                href="/Debarghya_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105"
              >
                Resume
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://github.com/debarghyaRONIN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/debarghya-saha-99baa624a/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-.88-.06-1.601-1-1.601-1 0-1.16.781-1.16 1.601v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 