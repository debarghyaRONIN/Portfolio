"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  description: string;
  image: string;
  link: string;
}

const ProjectCard: React.FC<Props> = ({ title, description, image, link }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm bg-black/50 border border-[#7042f88b] rounded-lg shadow overflow-hidden"
    >
      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
          {title}
        </h5>
        <p className="mb-3 font-normal text-gray-300">
          {description}
        </p>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-gradient-to-r from-red-600 to-yellow-500 rounded-lg hover:from-red-700 hover:to-yellow-600 focus:ring-4 focus:outline-none focus:ring-red-300"
        >
          View Project
        </a>
      </div>
    </motion.div>
  );
};

export default ProjectCard;