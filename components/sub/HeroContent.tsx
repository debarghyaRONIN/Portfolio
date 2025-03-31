"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  slideInFromLeft,
  slideInFromRight,
} from "@/utils/motion";
import Image from "next/image";

const HeroContent = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex flex-row items-center justify-center px-20 mt-40 w-full z-[20]"
    >
      <div className="h-full w-full flex flex-col gap-5 justify-center m-auto text-start">
        

        <motion.div
          variants={slideInFromLeft(0.5)}
          className="flex flex-col gap-6 mt-6 text-6xl font-bold text-white max-w-[600px] w-auto h-auto"
        >
          <span>
            Hey!
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">
              {" "}
              I&apos;m Debarghya{" "}
            </span>
          </span>
        </motion.div>

        <motion.div
          variants={slideInFromLeft(0.8)}
          className="text-[15px] text-gray-200 my-5 leading-[30px]"
        >
          I&apos;m a passionate Full Stack Developer with expertise in building modern web applications. I&apos;m currently pursuing my B.Tech in Computer Science and Engineering at the Institute of Engineering and Management, Kolkata.
        </motion.div>
        <motion.a
          variants={slideInFromLeft(1)}
          href="#skills"
          className="py-2 button-primary text-center text-white cursor-pointer rounded-lg max-w-[200px]"
        >
          Learn More!
        </motion.a>
      </div>

      <motion.div
        variants={slideInFromRight(0.8)}
        className="w-full h-full flex justify-center items-center"
      >
        <Image
          src="/mainIconsdark.svg"
          alt="work icons"
          height={650}
          width={650}
        />
      </motion.div>
    </motion.div>
  );
};

export default HeroContent;