// No need to import DashboardLayout as the page is already wrapped with SidebarLayout in App.tsx
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  PlusCircle, 
  BarChart2, 
  TrendingUp, 
  ListFilter, 
  Star, 
  Loader2, 
  BarChart3, 
  Trash2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define competitor schema
const competitorSchema = z.object({
  name: z.string().min(1, 'Competitor name is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  googlePlaceId: z.string().optional().or(z.literal('')),
  yelpBusinessId: z.string().optional().or(z.literal('')), 
  facebookPageId: z.string().optional().or(z.literal('')),
  applePlaceId: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type Competitor = {
  id: number;
  userId: number;
  name: string;
  website: string | null;
  googlePlaceId: string | null;
  yelpBusinessId: string | null;
  facebookPageId: string | null;
  applePlaceId: string | null;
  notes: string | null;
  createdAt: string;
};

type CompetitorReport = {
  id: number;
  competitorId: number;
  date: string;
  averageRating: number;
  totalReviews: number;
  positivePercentage: number;
  negativePercentage: number;
  platform: string;
};

type ReviewDistribution = {
  name: string;
  google: number;
  yelp: number;
  facebook: number;
  apple: number;
};

type RatingComparison = {
  name: string;
  yourBusiness: number;
  competitor: number;
};

type RatingTrend = {
  date: string;
  yourBusiness: number;
  competitor: number;
};

const CompetitorsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addCompetitorOpen, setAddCompetitorOpen] = useState(false);
  const [deletingCompetitor, setDeletingCompetitor] = useState<number | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('90days');

  // Fetch all competitors
  const { data: competitors, isLoading: competitorsLoading } = useQuery({
    queryKey: ['/api/competitors'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/competitors');
      return res.json();
    },
  });

  // Fetch reports for selected competitor
  const { data: competitorReports, isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ['/api/competitors/reports', selectedCompetitor?.id],
    queryFn: async () => {
      if (!selectedCompetitor) return null;
      const res = await apiRequest('GET', `/api/competitors/${selectedCompetitor.id}/reports?timeRange=${timeRange}`);
      return res.json();
    },
    enabled: !!selectedCompetitor,
  });

  // Add Competitor Form
  const competitorForm = useForm<z.infer<typeof competitorSchema>>({
    resolver: zodResolver(competitorSchema),
    defaultValues: {
      name: '',
      website: '',
      googlePlaceId: '',
      yelpBusinessId: '',
      facebookPageId: '',
      applePlaceId: '',
      notes: '',
    },
  });

  // Add Competitor Mutation
  const addCompetitorMutation = useMutation({
    mutationFn: async (values: z.infer<typeof competitorSchema>) => {
      const res = await apiRequest('POST', '/api/competitors', values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Competitor Added',
        description: 'The competitor has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/competitors'] });
      competitorForm.reset();
      setAddCompetitorOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add competitor: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete Competitor Mutation
  const deleteCompetitorMutation = useMutation({
    mutationFn: async (competitorId: number) => {
      await apiRequest('DELETE', `/api/competitors/${competitorId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Competitor Deleted',
        description: 'The competitor has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/competitors'] });
      setDeletingCompetitor(null);
      if (selectedCompetitor && selectedCompetitor.id === deletingCompetitor) {
        setSelectedCompetitor(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete competitor: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Fetch data manually for the selected competitor
  const refreshDataMutation = useMutation({
    mutationFn: async (competitorId: number) => {
      const res = await apiRequest('POST', `/api/competitors/${competitorId}/refresh`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Data Refreshed',
        description: 'The competitor data has been refreshed successfully.',
      });
      refetchReports();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to refresh data: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const onCompetitorSubmit = (values: z.infer<typeof competitorSchema>) => {
    addCompetitorMutation.mutate(values);
  };

  // Mock data for visualizations - In a real app, this would come from the API
  const reviewDistributionData: ReviewDistribution[] = [
    {
      name: 'Your Business',
      google: 45,
      yelp: 32,
      facebook: 15,
      apple: 8
    },
    {
      name: selectedCompetitor?.name || 'Competitor',
      google: 38,
      yelp: 27,
      facebook: 22,
      apple: 13
    }
  ];

  const ratingComparisonData: RatingComparison[] = [
    { name: 'Google', yourBusiness: 4.5, competitor: 4.2 },
    { name: 'Yelp', yourBusiness: 4.3, competitor: 4.1 },
    { name: 'Facebook', yourBusiness: 4.6, competitor: 4.4 },
    { name: 'Apple Maps', yourBusiness: 4.7, competitor: 4.5 }
  ];

  const ratingTrendData: RatingTrend[] = [
    { date: 'Jan', yourBusiness: 4.2, competitor: 4.1 },
    { date: 'Feb', yourBusiness: 4.3, competitor: 4.0 },
    { date: 'Mar', yourBusiness: 4.3, competitor: 4.2 },
    { date: 'Apr', yourBusiness: 4.4, competitor: 4.3 },
    { date: 'May', yourBusiness: 4.5, competitor: 4.2 },
    { date: 'Jun', yourBusiness: 4.6, competitor: 4.3 }
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">

        <Dialog open={addCompetitorOpen} onOpenChange={setAddCompetitorOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Competitor</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Competitor</DialogTitle>
              <DialogDescription>
                Add a competitor to track and compare their reviews and ratings.
              </DialogDescription>
            </DialogHeader>
            <Form {...competitorForm}>
              <form onSubmit={competitorForm.handleSubmit(onCompetitorSubmit)} className="space-y-4">
                <FormField
                  control={competitorForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitor Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Dentistry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={competitorForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={competitorForm.control}
                    name="googlePlaceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Place ID</FormLabel>
                        <FormControl>
                          <Input placeholder="ChIJ..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={competitorForm.control}
                    name="yelpBusinessId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yelp Business ID</FormLabel>
                        <FormControl>
                          <Input placeholder="abc-dentistry-city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={competitorForm.control}
                    name="facebookPageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook Page ID</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789012345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={competitorForm.control}
                    name="applePlaceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apple Maps Place ID</FormLabel>
                        <FormControl>
                          <Input placeholder="abcdef123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={competitorForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea className="h-24" placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={addCompetitorMutation.isPending}>
                    {addCompetitorMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Competitor
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Competitors List Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Competitors</CardTitle>
              <CardDescription>
                Select a competitor to view analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {competitorsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : competitors && competitors.length > 0 ? (
                <div className="space-y-2">
                  {competitors.map((competitor: Competitor) => (
                    <div 
                      key={competitor.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedCompetitor?.id === competitor.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => setSelectedCompetitor(competitor)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{competitor.name}</h3>
                          {competitor.website && (
                            <a 
                              href={competitor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground flex items-center hover:text-primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {competitor.website.replace(/(^\w+:|^)\/\//, '')}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                        <AlertDialog 
                          open={deletingCompetitor === competitor.id} 
                          onOpenChange={(open) => !open && setDeletingCompetitor(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingCompetitor(competitor.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the competitor "{competitor.name}" and all associated data.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCompetitorMutation.mutate(competitor.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteCompetitorMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {competitor.googlePlaceId && <Badge variant="outline" className="text-xs">Google</Badge>}
                        {competitor.yelpBusinessId && <Badge variant="outline" className="text-xs">Yelp</Badge>}
                        {competitor.facebookPageId && <Badge variant="outline" className="text-xs">Facebook</Badge>}
                        {competitor.applePlaceId && <Badge variant="outline" className="text-xs">Apple</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No competitors added yet.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setAddCompetitorOpen(true)}
                    className="mt-2"
                  >
                    Add your first competitor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Analysis Area */}
        <div className="lg:col-span-9">
          {!selectedCompetitor ? (
            <Card className="h-[500px] flex items-center justify-center">
              <CardContent className="text-center space-y-4">
                <BarChart2 className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                <h2 className="text-xl font-medium">Select a competitor</h2>
                <p className="text-muted-foreground max-w-md">
                  Choose a competitor from the list or add a new one to view detailed analysis and comparison.
                </p>
                <Button onClick={() => setAddCompetitorOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Competitor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedCompetitor.name}</CardTitle>
                      {selectedCompetitor.website && (
                        <a 
                          href={selectedCompetitor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground flex items-center hover:text-primary"
                        >
                          {selectedCompetitor.website.replace(/(^\w+:|^)\/\//, '')}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshDataMutation.mutate(selectedCompetitor.id)}
                      disabled={refreshDataMutation.isPending}
                    >
                      {refreshDataMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Refresh Data
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCompetitor.googlePlaceId && <Badge>Google</Badge>}
                    {selectedCompetitor.yelpBusinessId && <Badge>Yelp</Badge>}
                    {selectedCompetitor.facebookPageId && <Badge>Facebook</Badge>}
                    {selectedCompetitor.applePlaceId && <Badge>Apple</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCompetitor.notes && (
                      <div className="text-sm text-muted-foreground border-l-4 border-muted pl-4 py-2 italic">
                        {selectedCompetitor.notes}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-muted-foreground">Avg. Rating</h3>
                        <div className="flex items-center justify-center mt-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-2xl font-bold">4.3</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">vs. Your 4.5</p>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Reviews</h3>
                        <div className="text-2xl font-bold mt-1">127</div>
                        <p className="text-xs text-muted-foreground mt-1">vs. Your 183</p>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-muted-foreground">Positive %</h3>
                        <div className="text-2xl font-bold mt-1">76%</div>
                        <p className="text-xs text-muted-foreground mt-1">vs. Your 82%</p>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-muted-foreground">Response Rate</h3>
                        <div className="text-2xl font-bold mt-1">63%</div>
                        <p className="text-xs text-muted-foreground mt-1">vs. Your 89%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center">
                <Tabs defaultValue="overview" className="w-full" onValueChange={setSelectedTab}>
                  <div className="flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="platforms">Platforms</TabsTrigger>
                      <TabsTrigger value="trends">Trends</TabsTrigger>
                      <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    </TabsList>
                    
                    <Select
                      value={timeRange}
                      onValueChange={setTimeRange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="1year">Last Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Rating Comparison</CardTitle>
                        <CardDescription>
                          Average ratings across platforms compared to your business
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={ratingComparisonData}
                              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 5]} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="yourBusiness" name="Your Business" fill="#14b8a6" />
                              <Bar dataKey="competitor" name={selectedCompetitor.name} fill="#f97316" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Platform Distribution</CardTitle>
                          <CardDescription>
                            Review distribution across platforms
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={reviewDistributionData}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="google" name="Google" stackId="a" fill="#4285F4" />
                                <Bar dataKey="yelp" name="Yelp" stackId="a" fill="#D32323" />
                                <Bar dataKey="facebook" name="Facebook" stackId="a" fill="#3b5998" />
                                <Bar dataKey="apple" name="Apple" stackId="a" fill="#A2AAAD" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Rating Trend</CardTitle>
                          <CardDescription>
                            Average rating over time
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={ratingTrendData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[3.5, 5]} />
                                <Tooltip />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="yourBusiness" 
                                  name="Your Business" 
                                  stroke="#14b8a6" 
                                  activeDot={{ r: 8 }} 
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="competitor" 
                                  name={selectedCompetitor.name} 
                                  stroke="#f97316" 
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  {/* Platforms Tab */}
                  <TabsContent value="platforms" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Google Reviews</CardTitle>
                          <div className="flex items-center mt-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium mr-4">4.2</span>
                            <span className="text-sm text-muted-foreground">38 reviews</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <span className="text-sm w-16">5 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">45%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">4 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '32%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">32%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">3 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">15%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">2 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">5%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">1 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '3%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">3%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Yelp Reviews</CardTitle>
                          <div className="flex items-center mt-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium mr-4">4.1</span>
                            <span className="text-sm text-muted-foreground">27 reviews</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <span className="text-sm w-16">5 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">42%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">4 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">30%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">3 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '18%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">18%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">2 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '6%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">6%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">1 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '4%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">4%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Facebook Reviews</CardTitle>
                          <div className="flex items-center mt-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium mr-4">4.4</span>
                            <span className="text-sm text-muted-foreground">22 reviews</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <span className="text-sm w-16">5 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">50%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">4 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">35%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">3 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">10%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">2 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '3%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">3%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">1 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '2%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">2%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Apple Maps Reviews</CardTitle>
                          <div className="flex items-center mt-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium mr-4">4.5</span>
                            <span className="text-sm text-muted-foreground">13 reviews</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <span className="text-sm w-16">5 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '55%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">55%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">4 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '38%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">38%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">3 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">5%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">2 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '2%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">2%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm w-16">1 ★</span>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                              </div>
                              <span className="text-sm w-16 text-right">0%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  {/* Trends Tab */}
                  <TabsContent value="trends" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Rating Trend Over Time</CardTitle>
                        <CardDescription>
                          Comparing average ratings over the selected time period
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={ratingTrendData}
                              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis domain={[3.5, 5]} />
                              <Tooltip />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="yourBusiness" 
                                name="Your Business" 
                                stroke="#14b8a6" 
                                strokeWidth={2}
                                activeDot={{ r: 8 }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="competitor" 
                                name={selectedCompetitor.name} 
                                stroke="#f97316" 
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Review Volume Trend</CardTitle>
                        <CardDescription>
                          Number of new reviews over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { month: 'Jan', yours: 12, competitor: 8 },
                                { month: 'Feb', yours: 15, competitor: 11 },
                                { month: 'Mar', yours: 18, competitor: 14 },
                                { month: 'Apr', yours: 16, competitor: 12 },
                                { month: 'May', yours: 22, competitor: 17 },
                                { month: 'Jun', yours: 25, competitor: 18 }
                              ]}
                              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="yours" name="Your Business" fill="#14b8a6" />
                              <Bar dataKey="competitor" name={selectedCompetitor.name} fill="#f97316" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Keywords Tab */}
                  <TabsContent value="keywords" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Keyword Comparison</CardTitle>
                        <CardDescription>
                          Most common keywords in reviews
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={[
                                { keyword: 'Staff', yours: 85, competitor: 72 },
                                { keyword: 'Service', yours: 78, competitor: 65 },
                                { keyword: 'Price', yours: 45, competitor: 62 },
                                { keyword: 'Quality', yours: 83, competitor: 68 },
                                { keyword: 'Wait Time', yours: 58, competitor: 42 },
                                { keyword: 'Cleanliness', yours: 76, competitor: 70 },
                                { keyword: 'Location', yours: 62, competitor: 68 },
                                { keyword: 'Parking', yours: 45, competitor: 50 }
                              ]}
                              margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="keyword" />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="yours" name="Your Business" fill="#14b8a6" />
                              <Bar dataKey="competitor" name={selectedCompetitor.name} fill="#f97316" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Your Business Keywords</CardTitle>
                          <CardDescription>
                            Top positive and negative keywords
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Positive Keywords</h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">professional (85%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">friendly (82%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">helpful (78%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">knowledgeable (76%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">efficient (74%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">clean (72%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">excellent (68%)</Badge>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-2">Negative Keywords</h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">expensive (12%)</Badge>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">wait (10%)</Badge>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">parking (8%)</Badge>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">slow (6%)</Badge>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">busy (4%)</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>{selectedCompetitor.name} Keywords</CardTitle>
                          <CardDescription>
                            Top positive and negative keywords
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Positive Keywords</h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">friendly (80%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">professional (75%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">affordable (72%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">helpful (70%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">convenient (68%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">location (65%)</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">nice (62%)</Badge>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-2">Negative Keywords</h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">wait (15%)</Badge>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">slow (14%)</Badge>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">crowded (12%)</Badge>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">quality (10%)</Badge>
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">rude (8%)</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorsPage;