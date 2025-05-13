import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // On mount, read the preferred theme from localStorage or system preference
    const storedTheme = localStorage.getItem('repuradar_theme') as Theme | null;
    
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

  useEffect(() => {
    // Apply theme changes to the document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('repuradar_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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