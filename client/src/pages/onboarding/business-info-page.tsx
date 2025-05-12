import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Building2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

interface BusinessInfoPageProps {
  data: any;
  updateData: (section: string, data: any) => void;
  goNext: () => void;
}

// Industry options
const INDUSTRIES = [
  "Healthcare",
  "Dental",
  "Legal",
  "Accounting",
  "Real Estate",
  "Food & Beverage",
  "Retail",
  "Hospitality",
  "Automotive",
  "Home Services",
  "Beauty & Wellness",
  "Fitness",
  "Education",
  "Financial Services",
  "Technology",
  "Other"
];

export default function BusinessInfoPage({ 
  data, 
  updateData, 
  goNext 
}: BusinessInfoPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    businessName: data.businessInfo.businessName || "",
    industry: data.businessInfo.industry || "",
    contactName: data.businessInfo.contactName || user?.fullName || "",
    contactEmail: data.businessInfo.contactEmail || user?.email || "",
    contactPhone: data.businessInfo.contactPhone || "",
    logo: data.businessInfo.logo || null
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle industry selection
  const handleIndustryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      industry: value
    }));
  };
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.businessName || !formData.industry || !formData.contactName || !formData.contactEmail) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Update the data in parent component
    updateData('businessInfo', formData);
    
    // Move to next step
    goNext();
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-2">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Business Information</h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          Tell us about your business so we can customize your experience.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Your Business Name"
              required
            />
          </div>
          
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select 
              value={formData.industry} 
              onValueChange={handleIndustryChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="contactPhone">Phone Number</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="(123) 456-7890"
            />
          </div>
          
          <div className="space-y-2 sm:col-span-2">
            <Label>Business Logo (Optional)</Label>
            <Card 
              className="cursor-pointer border-dashed hover:border-primary/50 transition-colors" 
              onClick={handleLogoClick}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                {logoPreview ? (
                  <div className="text-center">
                    <img 
                      src={logoPreview} 
                      alt="Business logo preview" 
                      className="h-32 max-w-full object-contain mx-auto mb-2"
                    />
                    <p className="text-sm text-slate-500">Click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-2">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">Click to upload your logo</p>
                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <Button type="submit">
            Save and Continue
          </Button>
        </div>
      </form>
    </div>
  );
}