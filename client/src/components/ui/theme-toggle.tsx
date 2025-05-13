import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    // On mount, read theme from localStorage or system preference
    const storedTheme = localStorage.getItem('repuradar_theme') as 'light' | 'dark' | null;
    
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      // Check for system preference
      const userPrefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (userPrefersDark) {
        setTheme('dark');
        applyTheme('dark');
      }
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('repuradar_theme', newTheme);
  };
  
  // Helper function to get or create status element for screen reader announcements
  const getStatusElement = () => {
    return document.getElementById('theme-status') || (() => {
      const el = document.createElement('div');
      el.id = 'theme-status';
      el.setAttribute('aria-live', 'polite');
      el.classList.add('sr-only');
      document.body.appendChild(el);
      return el;
    })();
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    const isDark = theme === 'dark';
    
    // Update DOM classes and attributes
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    
    // Announce theme change to screen readers
    const statusElement = getStatusElement();
    statusElement.textContent = isDark ? 'Dark mode enabled' : 'Light mode enabled';
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={theme === 'dark'}
      role="switch"
    >
      <span className="sr-only">
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </span>
      {theme === 'light' ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}