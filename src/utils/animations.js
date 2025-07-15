/**
 * Utility functions for animations and smooth scrolling
 */

/**
 * Smoothly scrolls to the specified element
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Offset from the top in pixels (default: 0)
 * @param {number} duration - Duration of the scroll animation in ms (default: 500)
 */
export const scrollToElement = (elementId, offset = 0, duration = 500) => {
  const element = document.getElementById(elementId);
  
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  
  const startPosition = window.pageYOffset;
  const distance = offsetPosition - startPosition;
  
  let startTime = null;
  
  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  };
  
  // Easing function
  const ease = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };
  
  requestAnimationFrame(animation);
};

/**
 * Checks if an element is in the viewport
 * @param {HTMLElement} element - The element to check
 * @param {number} offset - Offset from the top in pixels (default: 0)
 * @returns {boolean} - True if the element is in the viewport
 */
export const isElementInViewport = (element, offset = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
    rect.bottom >= 0 &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right >= 0
  );
};

/**
 * Sets up intersection observer for elements with data-animate attribute
 * Adds 'animate' class when element enters viewport
 */
export const setupScrollAnimations = () => {
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  if (!animatedElements.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  animatedElements.forEach(element => {
    observer.observe(element);
  });
};

export default {
  scrollToElement,
  isElementInViewport,
  setupScrollAnimations
}; 