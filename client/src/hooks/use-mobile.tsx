import * as React from "react"

// Breakpoints matching Tailwind's default breakpoints
export const BREAKPOINTS = {
  sm: 640,   // Small devices (640px and up)
  md: 768,   // Medium devices (768px and up)
  lg: 1024,  // Large devices (1024px and up)
  xl: 1280,  // Extra large devices (1280px and up)
  xxl: 1536, // 2XL devices (1536px and up)
}

/**
 * Hook to check if the current viewport is considered mobile/tablet/desktop
 * @returns Object with boolean flags for different screen sizes
 */
export function useBreakpoints() {
  const [windowSize, setWindowSize] = React.useState({
    width: 0,
    height: 0,
  })

  React.useEffect(() => {
    // Initial size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Update on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return {
    isMobile: windowSize.width < BREAKPOINTS.md, // Below md breakpoint
    isTablet: windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg, // Between md and lg
    isDesktop: windowSize.width >= BREAKPOINTS.lg, // lg and above
    isSmallScreen: windowSize.width < BREAKPOINTS.sm, // Extra small devices
    isLargeScreen: windowSize.width >= BREAKPOINTS.xl, // Extra large screens
    screenWidth: windowSize.width,
    screenHeight: windowSize.height,
  }
}

/**
 * Legacy hook for mobile detection, maintains backward compatibility
 * @returns boolean indicating if the current viewport is mobile
 */
export function useIsMobile() {
  const { isMobile } = useBreakpoints()
  return isMobile
}
