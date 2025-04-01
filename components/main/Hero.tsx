"use client";

import React, { useState, useEffect, useRef } from "react";
import HeroContent from "../sub/HeroContent";
import { gsap } from "gsap";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  element: HTMLDivElement;
}

const Hero = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const bgRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);

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

  // Create particles
  useEffect(() => {
    const particlesContainer = particlesContainerRef.current;
    if (!particlesContainer) return;
    
    const createParticles = () => {
      // Clear existing particles first
      while (particlesContainer.firstChild) {
        particlesContainer.removeChild(particlesContainer.firstChild);
      }
      
      particlesRef.current = [];
      
      // Create new particles
      const numParticles = window.innerWidth < 768 ? 15 : 30;
      
      for (let i = 0; i < numParticles; i++) {
        // Create particle element
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full pointer-events-none';
        
        // Random size between 2px and 6px
        const size = Math.random() * 4 + 2;
        
        // Set style based on theme
        if (isDarkMode) {
          particle.style.background = `rgba(255, ${100 + Math.random() * 100}, ${Math.random() * 50}, ${0.1 + Math.random() * 0.4})`;
        } else {
          particle.style.background = `rgba(${Math.random() * 50}, ${100 + Math.random() * 100}, 255, ${0.1 + Math.random() * 0.4})`;
        }
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.boxShadow = `0 0 ${size * 2}px ${isDarkMode ? 'rgba(255, 100, 0, 0.3)' : 'rgba(0, 100, 255, 0.3)'}`;
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        
        // Add to container
        particlesContainer.appendChild(particle);
        
        // Create particle object
        particlesRef.current.push({
          x,
          y,
          size,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          element: particle
        });
      }
    };
    
    createParticles();
    
    // Update particles on window resize
    const handleResize = () => {
      createParticles();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let animationFrameId: number;
    
    const animateParticles = () => {
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary check
        if (particle.x < 0) particle.x = 100;
        if (particle.x > 100) particle.x = 0;
        if (particle.y < 0) particle.y = 100;
        if (particle.y > 100) particle.y = 0;
        
        // Update DOM element
        particle.element.style.left = `${particle.x}%`;
        particle.element.style.top = `${particle.y}%`;
      });
      
      animationFrameId = requestAnimationFrame(animateParticles);
    };
    
    animateParticles();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  // Adding GSAP animations for the background
  useEffect(() => {
    if (bgRef.current && gridRef.current) {
      // Animate the background
      gsap.fromTo(
        bgRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.inOut" }
      );

      // Animate the grid pattern
      gsap.fromTo(
        gridRef.current,
        { opacity: 0, scale: 1.1 },
        { opacity: 0.3, scale: 1, duration: 2, ease: "power2.out" }
      );

      // Create a continuous floating animation for the grid
      gsap.to(gridRef.current, {
        y: 10,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, []);

  // Add parallax effect to background on mouse move
  useEffect(() => {
    const heroElement = heroRef.current;
    const gridElement = gridRef.current;
    
    if (!heroElement || !gridElement) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate cursor position as percentage of viewport
      const mouseX = e.clientX / viewportWidth - 0.5; // -0.5 to 0.5
      const mouseY = e.clientY / viewportHeight - 0.5; // -0.5 to 0.5
      
      // Set state for other components
      setMousePosition({ x: mouseX, y: mouseY });
      
      // Apply parallax effect to grid with subtle movement
      gsap.to(gridElement, {
        x: mouseX * 40,
        y: mouseY * 40,
        duration: 1,
        ease: "power2.out"
      });
      
      // Add subtle rotation to hero section
      gsap.to(heroElement, {
        rotationY: mouseX * 2,
        rotationX: -mouseY * 2,
        transformPerspective: 1000,
        transformOrigin: "center center",
        duration: 1,
        ease: "power2.out"
      });
      
      // Influence nearby particles
      particlesRef.current.forEach(particle => {
        const particleX = (particle.x / 100) * viewportWidth;
        const particleY = (particle.y / 100) * viewportHeight;
        
        // Calculate distance between mouse and particle
        const dx = e.clientX - particleX;
        const dy = e.clientY - particleY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Influence particle if within 200px
        if (distance < 200) {
          // Calculate influence strength (stronger when closer)
          const strength = (200 - distance) / 200;
          
          // Push particle away from cursor
          gsap.to(particle.element, {
            x: `+=${dx * -0.1 * strength}`,
            y: `+=${dy * -0.1 * strength}`,
            scale: 1 + strength * 0.5,
            duration: 0.5,
            ease: "power2.out"
          });
        }
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={heroRef} className="relative flex flex-col h-full w-full perspective-container" id="home">
      <div 
        ref={bgRef}
        className="absolute top-0 z-[1] h-full w-full bg-[#0F0F0F]"
      >
        <div className="absolute z-[-1] h-full w-full opacity-30">
          <div 
            ref={gridRef}
            className="absolute top-0 left-0 right-0 bottom-0 bg-grid-pattern z-[-1] parallax-medium"
          ></div>
        </div>
        
        {/* Particles container */}
        <div
          ref={particlesContainerRef}
          className="absolute inset-0 z-0 overflow-hidden"
        ></div>
      </div>
      <HeroContent isDarkMode={isDarkMode} />
    </div>
  );
};

export default Hero;