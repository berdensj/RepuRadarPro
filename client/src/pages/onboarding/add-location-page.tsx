import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { MapPin, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddLocationPageProps {
  data: any;
  updateData: (section: string, data: any) => void;
  goNext: () => void;
}

// Array of US states
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function AddLocationPage({ 
  data, 
  updateData, 
  goNext 
}: AddLocationPageProps) {
  const { toast } = useToast();
  
  // Initialize locations from existing data
  const [locations, setLocations] = useState(data.locations || []);
  
  // New location form data
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    email: "",
    phone: ""
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle state selection
  const handleStateChange = (value: string) => {
    setNewLocation(prev => ({
      ...prev,
      state: value
    }));
  };
  
  // Add a new location
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newLocation.name || !newLocation.address || !newLocation.city || !newLocation.state || !newLocation.zip) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required address fields",
        variant: "destructive"
      });
      return;
    }
    
    // Add new location to the list
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    
    // Update data in parent component
    updateData('locations', updatedLocations);
    
    // Reset form
    setNewLocation({
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      email: "",
      phone: ""
    });
    
    toast({
      title: "Location added",
      description: `${newLocation.name} has been added to your locations`,
    });
  };
  
  // Remove location
  const handleRemoveLocation = (index: number) => {
    const updatedLocations = [...locations];
    updatedLocations.splice(index, 1);
    setLocations(updatedLocations);
    
    // Update data in parent component
    updateData('locations', updatedLocations);
    
    toast({
      title: "Location removed",
      description: "The location has been removed",
    });
  };
  
  // Handle continue
  const handleContinue = () => {
    if (locations.length === 0) {
      toast({
        title: "No locations added",
        description: "Please add at least one location before continuing",
        variant: "destructive"
      });
      return;
    }
    
    // Move to next step
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
          Add the locations you want to monitor for reviews. You can add multiple locations.
        </p>
      </div>
      
      {/* Existing locations */}
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
      
      {/* Add new location form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Location</CardTitle>
          <CardDescription>
            Enter the details for a new location you want to track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="locationForm" onSubmit={handleAddLocation} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={newLocation.name}
                  onChange={handleChange}
                  placeholder="Main Office, Downtown Store, etc."
                  required
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={newLocation.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={newLocation.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select 
                    value={newLocation.state} 
                    onValueChange={handleStateChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    name="zip"
                    value={newLocation.zip}
                    onChange={handleChange}
                    placeholder="12345"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Location Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newLocation.email}
                  onChange={handleChange}
                  placeholder="location@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Location Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newLocation.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="submit"
            form="locationForm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
          
          <Button
            onClick={handleContinue}
            disabled={locations.length === 0}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-center text-sm text-slate-500">
        <p>
          {locations.length === 0 
            ? "Please add at least one location to continue"
            : `You have added ${locations.length} ${locations.length === 1 ? 'location' : 'locations'}`}
        </p>
      </div>
    </div>
  );
}