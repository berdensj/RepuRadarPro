import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { generatePalette, generateDarkPalette } from '@/lib/color-utils';

type Theme = 'light' | 'dark';

export interface ThemeColors {
  [key: string]: string;
}

interface ThemeContextType {
  theme: Theme;
  primaryColor: string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
  applyThemeColors: (colors: ThemeColors, darkModeColors?: ThemeColors) => void;
}

const DEFAULT_PRIMARY_COLOR = '#2589e9'; // Default blue primary color

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY_COLOR);
  
  // Apply CSS variables to the document
  const applyThemeColors = (colors: ThemeColors, darkModeColors?: ThemeColors) => {
    // Apply light mode colors to root
    Object.entries(colors).forEach(([property, value]) => {
      document.documentElement.style.setProperty(`--${property}`, value);
    });
    
    // Apply dark mode colors if provided
    if (darkModeColors) {
      const darkModeStyle = document.getElementById('dark-mode-colors') || document.createElement('style');
      if (!darkModeStyle.id) {
        darkModeStyle.id = 'dark-mode-colors';
        document.head.appendChild(darkModeStyle);
      }
      
      let cssText = '.dark {\n';
      Object.entries(darkModeColors).forEach(([property, value]) => {
        cssText += `  --${property}: ${value};\n`;
      });
      cssText += '}';
      
      darkModeStyle.textContent = cssText;
    }
    
    // Save color theme to localStorage
    localStorage.setItem('repuradar_primary_color', primaryColor);
  };

  // Load theme preferences on mount
  useEffect(() => {
    // Read the preferred theme from localStorage or system preference
    const storedTheme = localStorage.getItem('repuradar_theme') as Theme | null;
    const storedColor = localStorage.getItem('repuradar_primary_color') || DEFAULT_PRIMARY_COLOR;
    
    // Set the primary color
    setPrimaryColor(storedColor);
    
    // Apply stored theme or use system preference
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Check for system preference
      const userPrefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (userPrefersDark) {
        setTheme('dark');
      }
    }
  }, []);

  // Apply theme changes whenever theme or primaryColor changes
  useEffect(() => {
    // Generate color palettes
    const lightPalette = generatePalette(primaryColor);
    const darkPalette = generateDarkPalette(primaryColor);
    
    // Apply color palettes
    applyThemeColors(lightPalette, darkPalette);
    
    // Toggle dark mode class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('repuradar_theme', theme);
  }, [theme, primaryColor]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Update primary color and regenerate palettes
  const handleSetPrimaryColor = (color: string) => {
    setPrimaryColor(color);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      primaryColor,
      setTheme, 
      toggleTheme, 
      setPrimaryColor: handleSetPrimaryColor,
      applyThemeColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}