import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);
}

// Custom cursor animation with improved smoothness
export const initializeCustomCursor = () => {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursorDot);

  // Use a more sophisticated approach with lerp for smoother cursor
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  const lerp = 0.15; // Linear interpolation factor - higher = faster cursor

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Create animation frame for smoother cursor
  function animateCursor() {
    // Calculate smooth movement with linear interpolation
    cursorX = cursorX + (mouseX - cursorX) * lerp;
    cursorY = cursorY + (mouseY - cursorY) * lerp;
    
    gsap.set(cursor, { 
      x: cursorX, 
      y: cursorY
    });
    
    gsap.set(cursorDot, { 
      x: mouseX, 
      y: mouseY
    });
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();

  // Add hover effect for all links and buttons
  const interactiveElements = document.querySelectorAll('a, button, .card-hover');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
      gsap.to(cursor, {
        scale: 1.5,
        duration: 0.3,
        ease: "elastic.out(1, 0.7)"
      });
    });
    
    element.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
};

// Hero animations with staggered elements
export const animateHero = () => {
  const tl = gsap.timeline();
  
  tl.fromTo(
    ".hero-welcome-box",
    { y: -50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
  )
    .fromTo(
      ".hero-name",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.75)" },
      "-=0.3" // Overlap with previous animation
    )
    .fromTo(
      ".hero-description",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(
      ".hero-buttons .button",
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.15, 
        duration: 0.7, 
        ease: "back.out(1.7)" 
      },
      "-=0.3"
    )
    .fromTo(
      ".hero-image",
      { scale: 0.8, opacity: 0, rotation: -5 },
      { 
        scale: 1, 
        opacity: 1, 
        rotation: 0,
        duration: 1.2, 
        ease: "elastic.out(1, 0.5)" 
      },
      "-=0.7" // Overlap with button animations
    );

  return tl;
};

// About section animations with 3D effects
export const animateAbout = () => {
  const aboutTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#about",
      start: "top 70%",
      end: "top 20%",
      toggleActions: "play none none reverse",
    }
  });
  
  aboutTl.fromTo(
    ".about-image-container",
    { 
      x: -100,
      opacity: 0,
      rotation: -5,
      transformOrigin: "center center"
    },
    {
      x: 0,
      opacity: 1,
      rotation: 0,
      duration: 1.1, 
      ease: "power3.out",
    }
  )
  .fromTo(
    ".about-text-container h2",
    {
      y: 30,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "back.out(1.7)",
    },
    "-=0.7"
  )
  .fromTo(
    ".about-text-container p",
    {
      y: 40,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
    },
    "-=0.5"
  )
  .fromTo(
    ".about-buttons a",
    {
      y: 30,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 0.7,
      ease: "back.out(1.7)",
    },
    "-=0.3"
  );
  
  // Add hover animations for buttons with more engaging effects
  gsap.utils.toArray(".about-buttons a").forEach((button: any) => {
    button.addEventListener("mouseenter", () => {
      gsap.to(button, {
        scale: 1.05,
        y: -5,
        boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        scale: 1,
        y: 0,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
};

// Skills section animations with staggered card effects
export const animateSkills = () => {
  const skillsTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#skills",
      start: "top 70%",
      toggleActions: "play none none reverse",
    }
  });
  
  skillsTl.fromTo(
    ".skill-header",
    { 
      y: 50, 
      opacity: 0 
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
    }
  )
  .fromTo(
    ".skill-card",
    {
      y: 100,
      opacity: 0,
      scale: 0.8,
      rotation: -1
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      rotation: 0,
      stagger: {
        each: 0.08,
        from: "center",
        grid: "auto"
      },
      duration: 0.7,
      ease: "back.out(1.7)",
    },
    "-=0.3"
  );
  
  // Add improved hover effect for skill cards
  gsap.utils.toArray(".skill-card").forEach((card: any) => {
    const cardContent = card.querySelector(".skill-content") || card;
    const cardIcon = card.querySelector(".skill-icon") || card.querySelector("svg") || null;
    
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -10,
        scale: 1.05,
        boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      if (cardIcon) {
        gsap.to(cardIcon, {
          scale: 1.2,
          rotation: 5,
          duration: 0.4,
          ease: "back.out(1.7)"
        });
      }
    });
    
    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      if (cardIcon) {
        gsap.to(cardIcon, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: "power2.inOut"
        });
      }
    });
  });
};

// Timeline animations with enhanced effects
export const animateTimeline = () => {
  // Create markers for better scroll-based animation
  gsap.utils.toArray(".timeline-item").forEach((item: any, i) => {
    gsap.fromTo(
      item,
      {
        x: i % 2 === 0 ? -100 : 100,
        opacity: 0
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: item,
          start: "top 80%",
          toggleActions: "play none none reverse",
        }
      }
    );
    
    // Add connecting lines animation
    const line = item.querySelector(".timeline-line");
    if (line) {
      gsap.fromTo(
        line,
        { 
          height: "0%",
          opacity: 0 
        },
        {
          height: "100%",
          opacity: 1,
          duration: 0.8,
          delay: 0.3,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }
  });
  
  // Animate timeline images with more interesting floating effect
  gsap.utils.toArray(".timeline-image").forEach((img: any) => {
    const randomY = 5 + Math.random() * 10; // Random between 5-15px
    const randomDuration = 1.5 + Math.random(); // Random between 1.5-2.5s
    
    gsap.to(img, {
      y: randomY,
      rotation: (Math.random() - 0.5) * 5, // Random rotation between -2.5 and 2.5 degrees
      duration: randomDuration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });
};

// Projects animations with card reveal effects
export const animateProjects = () => {
  const projectsTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#projects",
      start: "top 70%",
      toggleActions: "play none none reverse",
    }
  });
  
  projectsTl.fromTo(
    ".project-header",
    { 
      y: 50, 
      opacity: 0 
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
    }
  )
  .fromTo(
    ".project-card",
    {
      y: 120,
      opacity: 0,
      scale: 0.9
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      stagger: {
        each: 0.15,
        from: "start"
      },
      duration: 0.8,
      ease: "power3.out",
    },
    "-=0.4"
  );
  
  // Add hover effect for project cards with more engaging animations
  gsap.utils.toArray(".project-card").forEach((card: any) => {
    const cardImage = card.querySelector(".project-image") || null;
    const cardTitle = card.querySelector("h3") || null;
    const cardTech = card.querySelector(".project-tech") || null;
    
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -15,
        scale: 1.02,
        boxShadow: "0 20px 30px rgba(0,0,0,0.2)",
        duration: 0.4,
        ease: "power2.out"
      });
      
      if (cardImage) {
        gsap.to(cardImage, {
          scale: 1.08,
          duration: 0.5,
          ease: "power2.out"
        });
      }
      
      if (cardTitle) {
        gsap.to(cardTitle, {
          scale: 1.05,
          duration: 0.3
        });
      }
      
      if (cardTech) {
        gsap.fromTo(
          cardTech.children,
          { scale: 1 },
          { 
            scale: 1.1, 
            stagger: 0.05, 
            duration: 0.3,
            ease: "back.out(1.7)" 
          }
        );
      }
    });
    
    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        duration: 0.4,
        ease: "power2.out"
      });
      
      if (cardImage) {
        gsap.to(cardImage, {
          scale: 1,
          duration: 0.5,
          ease: "power2.out"
        });
      }
      
      if (cardTitle) {
        gsap.to(cardTitle, {
          scale: 1,
          duration: 0.3
        });
      }
      
      if (cardTech) {
        gsap.to(cardTech.children, {
          scale: 1,
          stagger: 0.02,
          duration: 0.2,
          ease: "power1.inOut"
        });
      }
    });
  });
};

// Floating elements animation with more natural movement
export const animateFloatingElements = () => {
  // Find elements with class 'float'
  gsap.utils.toArray('.float').forEach((el: any, i) => {
    // Create random animation parameters for natural movement
    const xMovement = 10 + Math.random() * 20; // Random X movement
    const yMovement = 15 + Math.random() * 20; // Random Y movement
    const duration = 2 + Math.random() * 3; // Random duration between 2-5s
    const delay = i * 0.1; // Staggered delay
    
    // Apply more natural floating animation
    gsap.to(el, {
      x: `random(${-xMovement}, ${xMovement})`,
      y: `random(${-yMovement}, ${yMovement})`,
      rotation: `random(${-5}, ${5})`,
      duration: duration,
      delay: delay,
      repeat: -1,
      repeatRefresh: true, // Get new random values on each repeat
      yoyo: true,
      ease: 'sine.inOut'
    });
  });
};

// Add page transition effect
export const initializePageTransitions = () => {
  // Get all internal links
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href') || '';
      
      // Create transition animation
      const tl = gsap.timeline();
      
      tl.to('.page-transition-overlay', {
        y: '0%',
        duration: 0.5,
        ease: 'power2.inOut'
      })
      .add(() => {
        // Scroll to target section
        gsap.to(window, {
          duration: 0.1,
          scrollTo: href
        });
      })
      .to('.page-transition-overlay', {
        y: '-100%',
        duration: 0.5,
        delay: 0.1,
        ease: 'power2.inOut'
      });
    });
  });
  
  // Create overlay element if it doesn't exist
  if (!document.querySelector('.page-transition-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #1C1C1C;
      transform: translateY(-100%);
      z-index: 9998;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
  }
};

// Initialize all animations
export const initializeGSAPAnimations = () => {
  // Add custom CSS for cursor
  const style = document.createElement('style');
  style.textContent = `
    .custom-cursor {
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid rgba(255, 100, 0, 0.5);
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      z-index: 9999;
      transition: border-color 0.3s;
      mix-blend-mode: difference;
    }
    
    .cursor-dot {
      position: fixed;
      width: 8px;
      height: 8px;
      background-color: rgba(255, 100, 0, 0.8);
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      z-index: 10000;
    }
    
    .cursor-hover {
      border-color: rgba(255, 180, 0, 0.5);
      background-color: rgba(255, 100, 0, 0.1);
    }
    
    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
    }
    
    .cursor-hover .cursor-dot {
      animation: pulse 1.5s infinite;
    }
    
    /* Hide cursor on mobile */
    @media (max-width: 768px) {
      .custom-cursor, .cursor-dot {
        display: none;
      }
    }
    
    /* Transition styles */
    .section-transition {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .section-transition.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  // Initialize ScrollTrigger refresh when images are loaded
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
  
  // Initialize custom cursor
  initializeCustomCursor();
  
  // Initialize page transitions
  initializePageTransitions();
  
  // Initialize section animations
  animateHero();
  animateAbout();
  animateSkills();
  animateTimeline();
  animateProjects();
  animateFloatingElements();
}; 