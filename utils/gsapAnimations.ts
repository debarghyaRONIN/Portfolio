import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);
}

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

// Initialize page transitions
export const initializePageTransitions = () => {
  // Get all internal links
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href') || '';
      
      gsap.to(window, {
        duration: 0,  // Changed from 0.8 to 0 for instant scrolling
        scrollTo: {
          y: href,
          offsetY: 80,  // Account for navbar height
          autoKill: false
        }
      });
    });
  });
};

// Initialize all animations
export const initializeGSAPAnimations = () => {
  // Initialize ScrollTrigger refresh when images are loaded
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
  
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