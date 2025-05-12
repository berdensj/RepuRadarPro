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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { MapPin, Plus, X } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Location name must be at least 2 characters."
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters."
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters."
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters."
  }),
  zip: z.string().min(5, {
    message: "ZIP code must be at least 5 characters."
  }),
  phone: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address."
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddLocationPageProps {
  data: any;
  updateData: (section: string, data: any) => void;
  goNext: () => void;
}

export default function AddLocationPage({ 
  data,
  updateData,
  goNext
}: AddLocationPageProps) {
  const { toast } = useToast();
  const [locations, setLocations] = useState<FormValues[]>(data.locations || []);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      email: ""
    },
  });
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    // Add new location
    const updatedLocations = [...locations, values];
    setLocations(updatedLocations);
    updateData('locations', updatedLocations);
    
    // Reset form
    form.reset();
    
    toast({
      title: "Location added",
      description: `${values.name} has been added to your account`
    });
  };
  
  // Handle remove location
  const handleRemoveLocation = (index: number) => {
    const updatedLocations = [...locations];
    updatedLocations.splice(index, 1);
    setLocations(updatedLocations);
    updateData('locations', updatedLocations);
    
    toast({
      title: "Location removed",
      description: "The location has been removed from your account"
    });
  };
  
  // Handle continue
  const handleContinue = () => {
    if (locations.length === 0) {
      toast({
        title: "No locations added",
        description: "Please add at least one location to continue",
        variant: "destructive"
      });
      return;
    }
    
    goNext();
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-2">
          <MapPin className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Add Your Locations</h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          Add the physical locations of your business to monitor reviews for each one
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Office, Downtown Branch, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="ZIP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="location@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Add Location
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-slate-800 mb-4">Location Management</h2>
          <p className="text-slate-600 mb-4">
            Add all the physical locations where your business operates. Each location will be tracked separately, allowing you to monitor performance by location.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-amber-800 mb-1">Why add multiple locations?</h3>
            <p className="text-sm text-amber-700">
              Adding each physical location helps us accurately track reviews on platforms like Google, Yelp, and Facebook that are specific to those locations. This gives you more detailed insights into performance by location.
            </p>
          </div>
        </div>
      </div>
      
      {locations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-slate-800">Your Locations</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {locations.map((location: {
              name: string;
              address: string;
              city: string;
              state: string;
              zip: string;
              phone: string;
              email: string;
            }, index: number) => (
              <Card key={index} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-red-500"
                  onClick={() => handleRemoveLocation(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 space-y-1 text-sm">
                  <p>{location.address}</p>
                  <p>{location.city}, {location.state} {location.zip}</p>
                  {location.phone && <p>Phone: {location.phone}</p>}
                  {location.email && <p>Email: {location.email}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleContinue}
          disabled={locations.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}