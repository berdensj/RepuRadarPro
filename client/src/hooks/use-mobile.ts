import { useEffect, useState } from 'react';

/**
 * Hook to detect mobile screen size
 * @param breakpoint - The breakpoint to use for detection in pixels (default: 1024 - lg breakpoint)
 * @returns boolean - Whether the screen is mobile sized
 */
export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to update state based on window width
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Initial check
    handleResize();
    
    // Set up the resize event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}