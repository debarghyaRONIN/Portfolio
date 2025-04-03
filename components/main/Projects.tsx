"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { animateProjects } from "@/utils/gsapAnimations";

interface ProjectCardProps {
  project: {
    title: string;
    description: string;
    image: string;
    technologies: string[];
    link: string;
  };
  index: number;
  isDarkMode: boolean;
}

// Project Card component with 3D tilt effect
const ProjectCard = ({ project, isDarkMode }: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Card styling classes
  const cardBgClasses = isDarkMode
    ? "bg-black/30 border-gray-800"
    : "bg-white/80 border-gray-200";
  
  const headingClasses = isDarkMode
    ? "text-white"
    : "text-gray-800";
  
  const descriptionClasses = isDarkMode
    ? "text-gray-300"
    : "text-gray-700";
  
  const cardHoverClasses = isDarkMode
    ? "hover:bg-[#111]/60 hover:border-orange-700/40"
    : "hover:bg-white hover:border-blue-400/60";

  useEffect(() => {
    const card = cardRef.current;
    const glareElement = glareRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    
    if (!card || !glareElement || !image || !content) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Get card dimensions and position
      const { left, top, width, height } = card.getBoundingClientRect();
      
      // Calculate mouse position relative to card center (range: -1 to 1)
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const percentX = (e.clientX - centerX) / (width / 2);
      const percentY = (e.clientY - centerY) / (height / 2);
      
      // Calculate position for glare effect (range: 0 to 100%)
      const glareX = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
      const glareY = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
      
      // Apply rotation to card (max 10 degrees)
      const rotateY = -percentX * 10;
      const rotateX = percentY * 10;
      
      // Apply 3D transforms with GSAP
      gsap.to(card, {
        rotateY: rotateY,
        rotateX: rotateX,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
        ease: "power2.out",
        duration: 0.5
      });
      
      // Subtle movement for the image
      gsap.to(image, {
        x: percentX * 15,
        y: percentY * 15,
        ease: "power2.out",
        duration: 0.5
      });
      
      // Even more subtle movement for the content
      gsap.to(content, {
        x: percentX * 5,
        y: percentY * 5,
        ease: "power2.out",
        duration: 0.5
      });
      
      // Update glare effect
      gsap.to(glareElement, {
        opacity: 0.15,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 70%)`,
        duration: 0.3
      });
    };

    const handleMouseLeave = () => {
      // Reset all transformations on mouse leave
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: "power3.out"
      });
      
      gsap.to(image, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      });
      
      gsap.to(content, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      });
      
      // Hide glare
      gsap.to(glareElement, {
        opacity: 0,
        duration: 0.3
      });
    };

    // Add shadow and scale effect on hover
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        boxShadow: isDarkMode 
          ? "0 20px 40px rgba(255, 100, 0, 0.2), 0 0 20px rgba(255, 100, 0, 0.1)" 
          : "0 20px 40px rgba(0, 100, 255, 0.2), 0 0 20px rgba(0, 100, 255, 0.1)",
        scale: 1.02,
        duration: 0.4
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
        scale: 1,
        duration: 0.4
      });
    });

    // Ensure links inside the card work properly with the 3D effect
    const links = card.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        gsap.to(link, {
          scale: 1.05,
          duration: 0.3
        });
      });
      
      link.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        gsap.to(link, {
          scale: 1,
          duration: 0.3
        });
      });
    });

    // Add event listeners
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener('mouseenter', () => {});
      card.removeEventListener('mouseleave', () => {});
      links.forEach(link => {
        link.removeEventListener('mouseenter', () => {});
        link.removeEventListener('mouseleave', () => {});
      });
    };
  }, [isDarkMode]);

  return (
    <div
      ref={cardRef}
      className={`project-card rounded-lg border ${cardBgClasses} backdrop-blur-sm overflow-hidden shadow-lg transition-all duration-500 ${cardHoverClasses} perspective-container`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        position: 'relative'
      }}
    >
      {/* Glare overlay */}
      <div 
        ref={glareRef} 
        className="absolute inset-0 z-10 pointer-events-none opacity-0"
        style={{ 
          borderRadius: 'inherit',
          mixBlendMode: 'overlay'
        }}
      ></div>
      
      {/* Card edge highlight */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(255,100,0,0.05) 0%, transparent 50%, rgba(255,100,0,0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(0,100,255,0.05) 0%, transparent 50%, rgba(0,100,255,0.05) 100%)',
          borderRadius: 'inherit'
        }}
      ></div>
      
      {/* Image container */}
      <div 
        ref={imageRef}
        className="w-full h-52 relative overflow-hidden transform-gpu"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translateZ(20px)'
        }}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transform-gpu"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      
      {/* Content */}
      <div 
        ref={contentRef}
        className="p-6 space-y-4 transform-gpu"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translateZ(10px)'
        }}
      >
        <h3 className={`text-xl font-bold ${headingClasses} transition-colors duration-500`}>
          {project.title}
        </h3>
        
        <p className={`${descriptionClasses} transition-colors duration-500`}>
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {project.technologies.map((tech, techIndex) => (
            <span
              key={techIndex}
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isDarkMode 
                  ? 'bg-orange-900/20 text-orange-300' 
                  : 'bg-blue-100 text-blue-800'
              } transition-colors duration-500`}
            >
              {tech}
            </span>
          ))}
        </div>
        
        <div className="pt-4 relative z-40">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
              isDarkMode
                ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white hover:from-yellow-500 hover:to-red-600'
                : 'bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-400 hover:to-blue-600'
            } transition-all duration-300 transform hover:scale-105 relative z-40`}
            style={{
              transform: 'translateZ(20px)',
              pointerEvents: 'auto'
            }}
          >
            View Project
          </a>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const projectsRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Check for mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener("resize", checkMobile);
    
    // Initialize project animations
    animateProjects();
    
    // Cleanup function to prevent memory leaks
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile]); // Re-run when mobile state changes

  const projects = [
    {
      title: "Stock Market Analysis",
      description: "A comprehensive stock market analysis tool that provides real-time data visualization and predictive analytics.",
      image: "/Stock.PNG",
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

  // Dynamic classes based on theme
  const bgClasses = isDarkMode 
    ? "bg-[#0A0A0A]" 
    : "bg-gray-100";
  
  const gradientClasses = isDarkMode
    ? "bg-gradient-to-r from-red-900/5 via-orange-800/5 to-yellow-700/5"
    : "bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-400/5";
  
  const headingGradient = isDarkMode 
    ? "from-red-600 to-yellow-500" 
    : "from-blue-600 to-blue-400";

  return (
    <section 
      id="projects" 
      ref={projectsRef}
      className={`${bgClasses} relative py-20 transition-colors duration-500`}
    >
      <div className="absolute inset-0 z-0 transition-colors duration-500">
        <div className={`absolute inset-0 ${gradientClasses}`}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 
            ref={titleRef}
            className={`project-header text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${headingGradient} transition-colors duration-500`}
          >
            Projects & Work
          </h2>
          
          <p 
            ref={descriptionRef}
            className={`mx-auto max-w-3xl ${isDarkMode ? "text-gray-300" : "text-gray-700"} text-lg transition-colors duration-500`}
          >
            I build applications with a focus on performance, scalability, and user experience. Here are some of my recent projects.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <ProjectCard 
              key={index} 
              project={project} 
              index={index} 
              isDarkMode={isDarkMode} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;