import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building, Store, Home, Utensils, Dumbbell, Home as HomeIcon, HeartPulse, Lightbulb } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  clientType: z.string({
    required_error: "Please select a business type",
  }),
  clientTypeCustom: z.string().optional(),
});

interface BusinessTypePageProps {
  data: any;
  updateData: (section: string, data: any) => void;
  goNext: () => void;
}

export default function BusinessTypePage({ 
  data, 
  updateData, 
  goNext
}: BusinessTypePageProps) {
  const { toast } = useToast();
  const [showCustomField, setShowCustomField] = useState(data.businessInfo?.clientType === "other");
  
  // Initialize form with default values or data from parent
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientType: data.businessInfo?.clientType || "",
      clientTypeCustom: data.businessInfo?.clientTypeCustom || "",
    },
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Set agency flag if the selection is Marketing or Reputation Agency
    const isAgency = values.clientType === "agency";
    
    // Update the businessInfo object with these new values
    const updatedBusinessInfo = {
      ...data.businessInfo,
      clientType: values.clientType,
      clientTypeCustom: values.clientTypeCustom,
      isAgency,
    };
    
    updateData('businessInfo', updatedBusinessInfo);
    
    toast({
      title: "Business type saved",
      description: "Your business type has been recorded"
    });
    
    // TODO: Future enhancement - set default AI tone based on business type
    
    goNext();
  };

  // Watch for changes to clientType field
  const watchClientType = form.watch("clientType");
  
  // Update showCustomField when clientType changes
  if (watchClientType === "other" && !showCustomField) {
    setShowCustomField(true);
  } else if (watchClientType !== "other" && showCustomField) {
    setShowCustomField(false);
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-2">
          <Store className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">What type of business do you manage?</h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          This helps us personalize your dashboard and AI-generated responses
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="clientType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg">Select your business type</FormLabel>
                <FormDescription>
                  Choose the option that best represents your business
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <Card className={`cursor-pointer hover:border-primary transition-colors ${field.value === 'medspa' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => form.setValue('clientType', 'medspa')}>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <HeartPulse className="h-5 w-5 text-purple-500" />
                        <CardTitle className="text-base">Med Spa / Aesthetic Clinic</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>Cosmetic treatments, aesthetic services, rejuvenation therapies</CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer hover:border-primary transition-colors ${field.value === 'dental' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => form.setValue('clientType', 'dental')}>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <Store className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-base">Dental Office</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>Dental care, orthodontics, cosmetic dentistry services</CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer hover:border-primary transition-colors ${field.value === 'homeservices' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => form.setValue('clientType', 'homeservices')}>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <Home className="h-5 w-5 text-amber-500" />
                        <CardTitle className="text-base">Home Services</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>Plumbing, HVAC, roofing, electrical, home repair</CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer hover:border-primary transition-colors ${field.value === 'restaurant' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => form.setValue('clientType', 'restaurant')}>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <Utensils className="h-5 w-5 text-red-500" />
                        <CardTitle className="text-base">Restaurant / Food Service</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>Restaurants, cafes, catering, food delivery services</CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer hover:border-primary transition-colors ${field.value === 'fitness' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => form.setValue('clientType', 'fitness')}>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-green-500" />
                        <CardTitle className="text-base">Fitness Studio / Gym</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>Fitness centers, yoga studios, personal training</CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer hover:border-primary transition-colors ${field.value === 'realestate' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => form.setValue('clientType', 'realestate')}>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <HomeIcon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">Real Estate Agent / Brokerage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>Real estate sales, property management, housing services</CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer hover:border-primary transition-colors ${field.value === 'agency' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => form.setValue('clientType', 'agency')}>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-base">Marketing or Reputation Agency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>Marketing services, PR, reputation management for clients</CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer hover:border-primary transition-colors ${field.value === 'other' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => form.setValue('clientType', 'other')}>
                      <CardHeader className="flex flex-row items-center gap-2">
                        <Building className="h-5 w-5 text-gray-500" />
                        <CardTitle className="text-base">Other</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>Any other type of business not listed above</CardDescription>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {showCustomField && (
            <FormField
              control={form.control}
              name="clientTypeCustom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please describe your business type</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Describe your business type" 
                      {...field} 
                      className="max-w-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <div className="flex justify-end">
            <Button type="submit">
              Save and Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}