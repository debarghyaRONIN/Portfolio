/**
 * Smoothly scrolls to a target element by its ID
 * @param id The ID of the element to scroll to
 * @param offset Optional offset from the top of the element (in pixels)
 * @param duration Duration of the scroll animation in milliseconds
 */
export const smoothScrollToId = (id: string, offset: number = 0, duration: number = 800): void => {
  // Find the target element
  const targetElement = document.getElementById(id);
  
  if (!targetElement) {
    console.warn(`Element with id "${id}" not found.`);
    return;
  }
  
  // Get the target position
  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distanceToTravel = targetPosition - startPosition;
  let startTime: number | null = null;
  
  // Animation function
  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Easing function - easeInOutCubic
    const ease = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    window.scrollTo(0, startPosition + distanceToTravel * ease(progress));
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }
  
  // Start the animation
  requestAnimationFrame(animation);
};

/**
 * Updates the active navigation item based on scroll position
 * @param navItems Array of navigation item IDs
 * @param offset Offset to consider a section in view (in pixels)
 */
export const updateActiveNavItem = (navItems: string[], offset: number = 100): string => {
  let currentActiveId = '';
  let maxVisibility = 0;
  
  navItems.forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how much of the section is visible in the viewport
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visiblePercentage = (visibleHeight / rect.height) * 100;
    
    // Check if this section is more visible than the previous one
    if (visiblePercentage > maxVisibility && rect.top < offset) {
      maxVisibility = visiblePercentage;
      currentActiveId = id;
    }
  });
  
  return currentActiveId;
}; 