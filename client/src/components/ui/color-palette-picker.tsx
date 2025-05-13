import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paintbrush, Check, RotateCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { 
  Slider, 
  SliderTrack, 
  SliderRange, 
  SliderThumb 
} from '@/components/ui/slider';
import { hexToHSL, hslToHex } from '@/lib/color-utils';

// Predefined color palettes
const PRESET_COLORS = [
  // Blues
  '#2589e9', // Default blue
  '#0284c7', // Sky blue
  '#2563eb', // Royal blue
  '#4338ca', // Indigo
  
  // Other colors
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#6d28d9', // Violet
  
  // Neutrals
  '#475569', // Slate
  '#334155', // Dark slate
  '#1e293b', // Darker slate
  '#0f172a', // Nearly black
];

export function ColorPalettePicker() {
  const { primaryColor, setPrimaryColor } = useTheme();
  const [selectedColor, setSelectedColor] = useState(primaryColor);
  const [customColor, setCustomColor] = useState(primaryColor);
  const [hsl, setHsl] = useState<[number, number, number]>([0, 0, 0]);

  // Update HSL values when custom color changes
  useEffect(() => {
    setHsl(hexToHSL(customColor));
  }, [customColor]);
  
  // Update CSS variables for slider backgrounds
  useEffect(() => {
    const [h, s, l] = hsl;
    document.documentElement.style.setProperty('--hue', h.toString());
    document.documentElement.style.setProperty('--saturation', s + '%');
    document.documentElement.style.setProperty('--lightness', l + '%');
  }, [hsl]);

  // Handle preset color selection
  const handleSelectPreset = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
  };

  // Apply the selected color to the theme
  const applySelectedColor = () => {
    setPrimaryColor(selectedColor);
  };

  // Reset to default
  const resetToDefault = () => {
    const defaultColor = '#2589e9';
    setSelectedColor(defaultColor);
    setCustomColor(defaultColor);
    setPrimaryColor(defaultColor);
  };

  // Update HSL component and recalculate hex
  const updateHsl = (idx: number, value: number) => {
    const newHsl = [...hsl] as [number, number, number];
    newHsl[idx] = value;
    setHsl(newHsl);
    const newHex = hslToHex(newHsl[0], newHsl[1], newHsl[2]);
    setCustomColor(newHex);
    setSelectedColor(newHex);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">Customize theme</span>
          <div 
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full" 
            style={{ backgroundColor: primaryColor }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-72">
        <div className="space-y-2">
          <h4 className="font-medium leading-none mb-2">Customize Theme</h4>
          
          <Tabs defaultValue="presets">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="presets" className="mt-3">
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="h-8 w-8 rounded-md flex items-center justify-center"
                    style={{ 
                      backgroundColor: color,
                      borderColor: selectedColor === color ? 'white' : 'transparent',
                      borderWidth: '2px',
                    }}
                    onClick={() => handleSelectPreset(color)}
                  >
                    {selectedColor === color && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="mt-3 space-y-4">
              <div>
                <div className="mb-4 h-10 rounded-md" style={{ backgroundColor: customColor }}></div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label htmlFor="hue">Hue: {Math.round(hsl[0])}</Label>
                      <span className="text-xs text-muted-foreground">(0-360)</span>
                    </div>
                    <Slider 
                      id="hue" 
                      min={0} 
                      max={360} 
                      step={1} 
                      value={[hsl[0]]}
                      onValueChange={(value) => updateHsl(0, value[0])}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label htmlFor="saturation">Saturation: {Math.round(hsl[1])}</Label>
                      <span className="text-xs text-muted-foreground">(0-100)</span>
                    </div>
                    <Slider 
                      id="saturation" 
                      min={0} 
                      max={100} 
                      step={1} 
                      value={[hsl[1]]}
                      onValueChange={(value) => updateHsl(1, value[0])}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label htmlFor="lightness">Lightness: {Math.round(hsl[2])}</Label>
                      <span className="text-xs text-muted-foreground">(0-100)</span>
                    </div>
                    <Slider 
                      id="lightness" 
                      min={0} 
                      max={100} 
                      step={1} 
                      value={[hsl[2]]}
                      onValueChange={(value) => updateHsl(2, value[0])}
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Hex: {customColor.toUpperCase()}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefault}
            >
              <RotateCcw className="mr-2 h-3 w-3" />
              Reset
            </Button>
            <Button 
              size="sm" 
              onClick={applySelectedColor}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}