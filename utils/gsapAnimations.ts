import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);
}

// Custom cursor animation
export const initializeCustomCursor = () => {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursorDot);

  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { 
      x: e.clientX, 
      y: e.clientY,
      duration: 0.5,
      ease: "power2.out" 
    });
    
    gsap.to(cursorDot, { 
      x: e.clientX, 
      y: e.clientY,
      duration: 0.1
    });
  });

  // Add hover effect for all links and buttons
  const interactiveElements = document.querySelectorAll('a, button, .card-hover');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
    });
    
    element.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
    });
  });
};

// Hero animations
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
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
    )
    .fromTo(
      ".hero-description",
      { opacity: 0 },
      { opacity: 1, duration: 0.7, ease: "power3.out" }
    )
    .fromTo(
      ".hero-buttons",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
    )
    .fromTo(
      ".hero-image",
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.5)" }
    );

  return tl;
};

// About section animations
export const animateAbout = () => {
  gsap.fromTo(
    ".about-image-container",
    { 
      x: -100,
      opacity: 0,
      rotation: -5
    },
    {
      x: 0,
      opacity: 1,
      rotation: 0,
      duration: 1, 
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#about",
        start: "top 70%",
        end: "top 20%",
        toggleActions: "play none none reverse",
      }
    }
  );

  gsap.fromTo(
    ".about-text-container",
    {
      x: 100,
      opacity: 0
    },
    {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#about",
        start: "top 70%",
        end: "top 20%",
        toggleActions: "play none none reverse",
      }
    }
  );

  gsap.fromTo(
    ".about-buttons a",
    {
      y: 30,
      opacity: 0,
      stagger: 0.2
    },
    {
      y: 0,
      opacity: 1,
      stagger: 0.2,
      duration: 0.7,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: "#about",
        start: "top 60%",
        end: "top 20%",
        toggleActions: "play none none reverse",
      }
    }
  );
  
  // Add hover animations for buttons
  gsap.utils.toArray(".about-buttons a").forEach((button: any) => {
    button.addEventListener("mouseenter", () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: "power1.out"
      });
    });
    
    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: "power1.out"
      });
    });
  });
};

// Skills section animations
export const animateSkills = () => {
  gsap.fromTo(
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
      scrollTrigger: {
        trigger: "#skills",
        start: "top 70%",
        toggleActions: "play none none reverse",
      }
    }
  );

  gsap.fromTo(
    ".skill-card",
    {
      y: 100,
      opacity: 0,
      scale: 0.8
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      stagger: 0.1,
      duration: 0.7,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: "#skills",
        start: "top 60%",
        toggleActions: "play none none reverse",
      }
    }
  );
  
  // Add hover effect for skill cards
  gsap.utils.toArray(".skill-card").forEach((card: any) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -10,
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
};

// Timeline animations
export const animateTimeline = () => {
  gsap.fromTo(
    ".timeline-item",
    {
      x: (i) => i % 2 === 0 ? -100 : 100,
      opacity: 0
    },
    {
      x: 0,
      opacity: 1,
      stagger: 0.3,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#timeline",
        start: "top 70%",
        toggleActions: "play none none reverse",
      }
    }
  );
  
  // Animate timeline images with continuous subtle floating effect
  gsap.utils.toArray(".timeline-image").forEach((img: any) => {
    gsap.to(img, {
      y: "10px",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });
};

// Projects animations
export const animateProjects = () => {
  gsap.fromTo(
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
      scrollTrigger: {
        trigger: "#projects",
        start: "top 70%",
        toggleActions: "play none none reverse",
      }
    }
  );

  gsap.fromTo(
    ".project-card",
    {
      y: 100,
      opacity: 0,
      scale: 0.9
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      stagger: 0.2,
      duration: 0.8,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: "#projects",
        start: "top 60%",
        toggleActions: "play none none reverse",
      }
    }
  );
  
  // Add hover effect for project cards
  gsap.utils.toArray(".project-card").forEach((card: any) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -15,
        scale: 1.02,
        boxShadow: "0 20px 30px rgba(0,0,0,0.2)",
        duration: 0.4,
        ease: "power2.out"
      });
    });
    
    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        duration: 0.4,
        ease: "power2.out"
      });
    });
  });
};

// Floating elements animation
export const animateFloatingElements = () => {
  // Find elements with class 'float'
  gsap.utils.toArray('.float').forEach((el: any, i) => {
    // Create random animation parameters for natural movement
    const duration = 2 + Math.random() * 3; // Random duration between 2-5s
    const delay = i * 0.1; // Staggered delay
    
    // Apply floating animation
    gsap.to(el, {
      y: '20px',
      duration: duration,
      delay: delay,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  });
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
      transition: width 0.3s, height 0.3s, border-color 0.3s;
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
      width: 60px;
      height: 60px;
      border-color: rgba(255, 180, 0, 0.5);
      background-color: rgba(255, 100, 0, 0.1);
      mix-blend-mode: difference;
    }
    
    /* Hide cursor on mobile */
    @media (max-width: 768px) {
      .custom-cursor, .cursor-dot {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize ScrollTrigger refresh when images are loaded
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
  
  // Initialize custom cursor
  initializeCustomCursor();
  
  // Initialize section animations
  animateHero();
  animateAbout();
  animateSkills();
  animateTimeline();
  animateProjects();
  animateFloatingElements();
}; 