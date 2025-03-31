"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

const Projects = () => {
  const projectsRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const projectRefsArray = useRef<(HTMLDivElement | null)[]>([]);
  const techBadgeRefs = useRef<(HTMLSpanElement | null)[][]>([]);
  const imageFadeRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    
    // Create a context to prevent GSAP conflicts
    const ctx = gsap.context(() => {
      // Title animation with enhanced visual effect
      gsap.fromTo(titleRef.current, 
        { 
          y: 40, 
          opacity: 0,
          scale: 0.9
        },
        { 
          y: 0, 
          opacity: 1,
          scale: 1, 
          duration: 0.8, 
          ease: "elastic.out(1, 0.7)",
          clearProps: "all" // Prevents glitches after animation
        }
      );
      
      // Description animation with enhanced effect
      gsap.fromTo(descriptionRef.current,
        { 
          y: 30, 
          opacity: 0,
          scale: 0.95 
        },
        { 
          y: 0, 
          opacity: 1,
          scale: 1, 
          duration: 0.8, 
          delay: 0.3, 
          ease: "power2.out",
          clearProps: "all"
        }
      );
      
      // Project cards animation with staggered effect
      projectRefsArray.current.forEach((project, index) => {
        if (project) {
          // Card animation - more dramatic slide-in and scale effect
          const xOffset = isMobile ? 20 : 80;
          const entryDelay = 0.3 + (index * 0.2);
          
          // Base card animation
          gsap.fromTo(project,
            { 
              x: index % 2 === 0 ? -xOffset : xOffset, 
              y: isMobile ? 20 : 40,
              opacity: 0,
              scale: 0.9,
              rotateY: index % 2 === 0 ? -5 : 5
            },
            { 
              x: 0, 
              y: 0,
              opacity: 1,
              scale: 1,
              rotateY: 0,
              duration: 1, 
              delay: entryDelay, 
              ease: "power3.out",
              clearProps: "transform",
              scrollTrigger: {
                trigger: project,
                start: "top bottom-=100",
                toggleActions: "play none none none",
                invalidateOnRefresh: true
              }
            }
          );
          
          // Add shine effect on the cards
          gsap.fromTo(project,
            {
              backgroundPosition: "0% 0%"
            },
            {
              backgroundPosition: "100% 100%",
              duration: 1.5,
              delay: entryDelay + 0.5,
              ease: "sine.inOut",
              scrollTrigger: {
                trigger: project,
                start: "top bottom-=100"
              }
            }
          );
          
          // Image reveal animation
          if (imageFadeRefs.current[index]) {
            gsap.fromTo(imageFadeRefs.current[index],
              {
                opacity: 0,
                scale: 1.1
              },
              {
                opacity: 1,
                scale: 1,
                duration: 1.2,
                delay: entryDelay + 0.1,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: project,
                  start: "top bottom-=100"
                }
              }
            );
          }
          
          // Tech badge staggered animation
          if (techBadgeRefs.current[index] && techBadgeRefs.current[index].length > 0) {
            gsap.fromTo(techBadgeRefs.current[index],
              {
                y: 20,
                opacity: 0,
                scale: 0.8
              },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.4,
                stagger: 0.1,
                delay: entryDelay + 0.4,
                ease: "back.out(1.7)",
                scrollTrigger: {
                  trigger: project,
                  start: "top bottom-=80"
                }
              }
            );
          }
        }
      });
    });
    
    // Cleanup function to prevent memory leaks
    return () => {
      window.removeEventListener("resize", checkMobile);
      ctx.revert(); // This will kill all animations created in this context
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile]); // Re-run when mobile state changes

  // Helper function to store tech badge refs
  const setTechBadgeRef = (el: HTMLSpanElement | null, projectIndex: number, badgeIndex: number) => {
    if (!techBadgeRefs.current[projectIndex]) {
      techBadgeRefs.current[projectIndex] = [];
    }
    techBadgeRefs.current[projectIndex][badgeIndex] = el;
  };

  // Helper function to store image refs
  const setImageFadeRef = (el: HTMLDivElement | null, index: number) => {
    imageFadeRefs.current[index] = el;
  };

  // Clear refs array and set its length to match projects
  const setProjectRefs = (el: HTMLDivElement | null, index: number) => {
    projectRefsArray.current[index] = el;
  };

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
  
  const cardBgClasses = isDarkMode
    ? "bg-black/30 border-gray-800"
    : "bg-white/80 border-gray-200";
  
  const headingClasses = isDarkMode
    ? "text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500"
    : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400";

  const textClasses = isDarkMode
    ? "text-gray-300"
    : "text-gray-700";
  
  const techBadgeClasses = isDarkMode
    ? "bg-[#161616] text-red-400"
    : "bg-gray-200 text-blue-500";
  
  const buttonClasses = isDarkMode
    ? "bg-gradient-to-r from-red-700 to-yellow-600 text-white hover:from-yellow-600 hover:to-red-700"
    : "bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-500 hover:to-blue-600";

  const cardTitleClasses = "text-white";
  
  const cardOverlayClasses = isDarkMode 
    ? "bg-gradient-to-t from-black/80 to-transparent" 
    : "bg-gradient-to-t from-black/70 to-transparent";

  const cardHoverClasses = isDarkMode
    ? "hover:shadow-xl hover:shadow-red-900/10 hover:border-red-700/30 hover:translate-y-[-5px]"
    : "hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-300 hover:translate-y-[-5px]";

  return (
    <div 
      className={`relative flex flex-col h-full w-full transition-colors duration-500`} 
      id="projects" 
      ref={projectsRef}
    >
      {/* Animated particles background */}
      <div className="absolute inset-0 w-full h-full z-[1] overflow-hidden">
        <div className={`absolute inset-0 transition-colors duration-500 ${bgClasses}`}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className={`absolute inset-0 transition-colors duration-500 ${gradientClasses}`}></div>
        
        {/* Animated orbs/particles */}
        <div className="absolute inset-0 opacity-20">
          {isDarkMode ? (
            <div className="orb red"></div>
          ) : (
            <div className="orb light"></div>
          )}
          <div className="orb small"></div>
          <div className="orb tiny"></div>
        </div>
      </div>
      
      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col gap-8 md:gap-12">
          <div className="text-center relative">            
            <h2 
              ref={titleRef}
              className={`text-3xl md:text-4xl font-bold mb-3 md:mb-4 transition-colors duration-500 ${headingClasses}`}
            >
              Projects
            </h2>
            
            <p
              ref={descriptionRef}
              className={`text-xs md:text-base max-w-[600px] mx-auto px-2 transition-colors duration-500 ${textClasses}`}
            >
              Showcasing innovative solutions where theory meets practice. Each project represents a unique challenge solved with technical expertise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {projects.map((project, index) => (
              <div
                key={project.title}
                ref={(el) => setProjectRefs(el, index)}
                className={`backdrop-blur-sm rounded-xl overflow-hidden border shadow-xl card-hover transition-all duration-500 ${cardBgClasses} ${cardHoverClasses} animate-card-shine`}
                style={{ backgroundSize: '200% 200%' }}
              >
                {project.image && (
                  <div className="relative h-48 sm:h-60 w-full overflow-hidden">
                    <div ref={(el) => setImageFadeRef(el, index)} className="w-full h-full">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transform hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 2}
                      />
                    </div>
                    <div className={`absolute inset-0 transition-colors duration-500 ${cardOverlayClasses}`}></div>
                    <h3 className={`absolute bottom-3 md:bottom-4 left-4 md:left-6 text-xl md:text-2xl font-bold transition-colors duration-500 ${cardTitleClasses}`}>{project.title}</h3>
                  </div>
                )}
                
                <div className="p-4 md:p-6">
                  <p className={`whitespace-pre-line mb-4 md:mb-6 text-xs md:text-sm transition-colors duration-500 ${textClasses}`}>{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={tech}
                        ref={(el) => setTechBadgeRef(el, index, techIndex)}
                        className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium transition-colors duration-500 ${techBadgeClasses} hover:scale-110 hover:shadow-lg transition-transform`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 transform hover:scale-105 ${buttonClasses} hover:shadow-lg`}
                  >
                    View Project
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 ml-2 animate-pulse-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for animated orbs */}
      <style jsx>{`
        .orb {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: orbFloat 15s ease-in-out infinite alternate;
        }
        .orb.red {
          background: radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(185,28,28,0.1) 70%);
          top: 10%;
          right: 10%;
        }
        .orb.light {
          background: radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(37,99,235,0.1) 70%);
          top: 10%;
          right: 10%;
        }
        .orb.small {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, ${isDarkMode ? 
            'rgba(245,158,11,0.2) 0%, rgba(252,211,77,0.1) 70%' : 
            'rgba(96,165,250,0.2) 0%, rgba(147,197,253,0.1) 70%'});
          bottom: 30%;
          left: 10%;
          animation-delay: -5s;
          animation-duration: 20s;
        }
        .orb.tiny {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, ${isDarkMode ? 
            'rgba(244,63,94,0.2) 0%, rgba(251,113,133,0.1) 70%' : 
            'rgba(59,130,246,0.2) 0%, rgba(96,165,250,0.1) 70%'});
          top: 60%;
          left: 30%;
          animation-delay: -2s;
          animation-duration: 10s;
        }
        
        @keyframes orbFloat {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, 20px) scale(1.05);
          }
          100% {
            transform: translate(-30px, -20px) scale(0.95);
          }
        }
        
        .animate-card-shine {
          background-image: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shine 5s infinite;
        }
        
        @keyframes shine {
          0% {
            background-position: -100% -100%;
          }
          100% {
            background-position: 200% 200%;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulsate 2s ease-in-out infinite;
        }
        
        @keyframes pulsate {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Projects;