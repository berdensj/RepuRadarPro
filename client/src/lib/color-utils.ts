/**
 * Utility functions for color manipulation and palette generation
 */

/**
 * Convert a hex color to HSL (Hue, Saturation, Lightness) values
 * @param hex Hex color string (e.g., "#1a2b3c" or "#123")
 * @returns HSL values as [h, s, l] where h ∈ [0, 360), s ∈ [0, 100], l ∈ [0, 100]
 */
export function hexToHSL(hex: string): [number, number, number] {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  
  // Handle 3-digit hex
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } 
  // Handle 6-digit hex
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  
  // Convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Convert HSL values to a hex color string
 * @param h Hue value (0-360)
 * @param s Saturation value (0-100)
 * @param l Lightness value (0-100)
 * @returns Hex color string (e.g., "#1a2b3c")
 */
export function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HSL values to the format used by CSS variables (space-separated values)
 * @param h Hue value (0-360)
 * @param s Saturation value (0-100)
 * @param l Lightness value (0-100)
 * @returns CSS HSL value (e.g., "210 40% 98%")
 */
export function hslToCssVar(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

/**
 * Parse a CSS HSL value into [h, s, l] components
 * @param hslStr CSS HSL value (e.g., "210 40% 98%")
 * @returns HSL values as [h, s, l]
 */
export function cssVarToHsl(hslStr: string): [number, number, number] {
  const parts = hslStr.split(' ');
  return [
    parseInt(parts[0], 10),
    parseInt(parts[1], 10),
    parseInt(parts[2], 10)
  ];
}

/**
 * Generate a harmonious color palette based on a primary color
 * @param primaryHex Primary color in hex format
 * @returns Object containing color palette values in CSS variable format
 */
export function generatePalette(primaryHex: string) {
  const [hue, saturation, lightness] = hexToHSL(primaryHex);
  
  // Create palette variations
  return {
    // Primary colors
    primary: hslToCssVar(hue, saturation, 54),
    'primary-foreground': hslToCssVar(hue, 100, 99),
    
    // Background and foreground
    background: hslToCssVar(hue, 10, 99),
    foreground: hslToCssVar(hue, 15, 9),
    
    // Card
    card: hslToCssVar(hue, 5, 100),
    'card-foreground': hslToCssVar(hue, 15, 9),
    
    // Muted
    muted: hslToCssVar(hue, 5, 96),
    'muted-foreground': hslToCssVar(hue, 10, 40),
    
    // Secondary
    secondary: hslToCssVar(hue, 5, 96),
    'secondary-foreground': hslToCssVar(hue, 10, 9),
    
    // Accent
    accent: hslToCssVar(hue, 5, 96),
    'accent-foreground': hslToCssVar(hue, 10, 9),
    
    // Border and ring
    border: hslToCssVar(hue, 6, 90),
    input: hslToCssVar(hue, 6, 90),
    ring: hslToCssVar(hue, 15, 9),
    
    // Charts (generate complementary and analogous colors)
    'chart-1': hslToCssVar(hue, saturation, 54),
    'chart-2': hslToCssVar((hue + 60) % 360, saturation - 10, 50),
    'chart-3': hslToCssVar((hue + 180) % 360, saturation, 50),
    'chart-4': hslToCssVar((hue + 120) % 360, saturation, 50),
    'chart-5': hslToCssVar((hue + 240) % 360, saturation, 50),
    
    // Sidebar
    'sidebar-background': hslToCssVar(hue, 40, 98),
    'sidebar-foreground': hslToCssVar(hue + 10, 47, 11),
    'sidebar-primary': hslToCssVar(hue, saturation, 54),
    'sidebar-primary-foreground': hslToCssVar(hue, 100, 99),
    'sidebar-accent': hslToCssVar(hue, 40, 96),
    'sidebar-accent-foreground': hslToCssVar(hue + 10, 47, 11),
    'sidebar-border': hslToCssVar(hue + 5, 34, 89),
    'sidebar-ring': hslToCssVar(hue + 10, 47, 11),
  };
}

/**
 * Generate a dark mode palette based on a primary color
 * @param primaryHex Primary color in hex format
 * @returns Object containing dark mode color palette values in CSS variable format
 */
export function generateDarkPalette(primaryHex: string) {
  const [hue, saturation, lightness] = hexToHSL(primaryHex);
  
  return {
    // Primary colors (keep similar to light mode)
    primary: hslToCssVar(hue, saturation, 54),
    'primary-foreground': hslToCssVar(hue, 100, 99),
    
    // Background and foreground (inverted from light mode)
    background: hslToCssVar(hue, 10, 4),
    foreground: hslToCssVar(hue, 5, 98),
    
    // Card
    card: hslToCssVar(hue, 10, 4),
    'card-foreground': hslToCssVar(hue, 5, 98),
    
    // Muted
    muted: hslToCssVar(hue, 7, 16),
    'muted-foreground': hslToCssVar(hue, 5, 65),
    
    // Secondary
    secondary: hslToCssVar(hue, 7, 16),
    'secondary-foreground': hslToCssVar(hue, 5, 98),
    
    // Accent
    accent: hslToCssVar(hue, 7, 16),
    'accent-foreground': hslToCssVar(hue, 5, 98),
    
    // Border and ring
    border: hslToCssVar(hue, 7, 16),
    input: hslToCssVar(hue, 7, 16),
    ring: hslToCssVar(hue, 5, 84),
    
    // Charts (maintain similar to light mode for consistency)
    'chart-1': hslToCssVar(hue, saturation, 54),
    'chart-2': hslToCssVar((hue + 60) % 360, saturation - 10, 50),
    'chart-3': hslToCssVar((hue + 180) % 360, saturation, 50),
    'chart-4': hslToCssVar((hue + 120) % 360, saturation, 50),
    'chart-5': hslToCssVar((hue + 240) % 360, saturation, 50),
    
    // Sidebar
    'sidebar-background': hslToCssVar(hue, 10, 8),
    'sidebar-foreground': hslToCssVar(hue, 5, 98),
    'sidebar-primary': hslToCssVar(hue, saturation, 54),
    'sidebar-primary-foreground': hslToCssVar(hue, 100, 99),
    'sidebar-accent': hslToCssVar(hue, 7, 16),
    'sidebar-accent-foreground': hslToCssVar(hue, 5, 98),
    'sidebar-border': hslToCssVar(hue, 7, 16),
    'sidebar-ring': hslToCssVar(hue, 5, 84),
  };
}