import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
// No need to import DashboardLayout as the page is already wrapped with SidebarLayout in App.tsx
import { Helmet } from 'react-helmet';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  Mail, 
  Phone, 
  MessageSquare, 
  Play,
  ArrowRight,
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

// Support ticket schema
const supportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  priority: z.string().default('medium'),
});

// Knowledge base search schema
const searchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
});

export default function HelpPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Support ticket form
  const ticketForm = useForm<z.infer<typeof supportTicketSchema>>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: '',
      category: '',
      message: '',
      priority: 'medium',
    },
  });

  // Search form
  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    },
  });

  // Submit support ticket mutation
  const submitTicketMutation = useMutation({
    mutationFn: async (values: z.infer<typeof supportTicketSchema>) => {
      const res = await apiRequest('POST', '/api/support/tickets', values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Ticket Submitted',
        description: 'Your support ticket has been submitted successfully. We\'ll get back to you soon.',
      });
      ticketForm.reset();
      setTicketSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Search knowledge base mutation
  const searchKnowledgeBaseMutation = useMutation({
    mutationFn: async (values: z.infer<typeof searchSchema>) => {
      const res = await apiRequest('GET', `/api/help/search?q=${encodeURIComponent(values.query)}`);
      return res.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.results);
    },
    onError: (error: Error) => {
      toast({
        title: 'Search Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle form submissions
  const onTicketSubmit = (values: z.infer<typeof supportTicketSchema>) => {
    submitTicketMutation.mutate(values);
  };

  const onSearchSubmit = (values: z.infer<typeof searchSchema>) => {
    searchKnowledgeBaseMutation.mutate(values);
  };

  // FAQ items
  const faqItems = [
    {
      question: "How do I set up my first location?",
      answer: "To set up your first location, go to the Settings page and click on 'Add Location'. Fill in the details of your business location including name, address, and any platform IDs for Google, Yelp, Facebook, or Apple Maps. Once added, you can start monitoring reviews for this location."
    },
    {
      question: "How do I connect my Google My Business account?",
      answer: "Go to the Integrations page and select the Google Places tab. You'll need to enter your Google Place ID and API key. You can find your Place ID using Google's Place ID Finder tool. For the API key, you'll need to create one in the Google Cloud Console with the Places API enabled."
    },
    {
      question: "Can I respond to reviews directly from RepuRadar?",
      answer: "Yes! Once you've connected your review platforms, you can view and respond to all your reviews from the Reviews page. For negative reviews, you can use our AI-powered response suggestions to craft the perfect reply."
    },
    {
      question: "How do I set up alerts for negative reviews?",
      answer: "Navigate to your Profile page and select the Notifications tab. Here you can enable alerts for new reviews and set a threshold for negative review alerts. You can choose to be notified via email, SMS, or both."
    },
    {
      question: "How can I request reviews from my customers?",
      answer: "Use our Review Requests page to send personalized invitations to your customers via email or SMS. You can create custom templates and track which requests have been opened, clicked, and completed."
    },
    {
      question: "What's the difference between the various subscription plans?",
      answer: "Our Free plan includes basic review monitoring for one location. The Pro plan adds multiple locations, advanced analytics, and AI response suggestions. The Business plan includes unlimited locations, white-label reporting, and API access. View the complete comparison on the Profile > Billing page."
    },
    {
      question: "Can I track my competitors' reviews?",
      answer: "Yes, with our Competitor Analysis feature, you can monitor your competitors' ratings and reviews across all platforms. Simply add a competitor on the Competitors page and provide their business information or platform IDs."
    },
    {
      question: "How accurate are the AI-generated response suggestions?",
      answer: "Our AI responses are powered by OpenAI's advanced language models and are tailored to your business type and the specific review content. They're designed to be professional, empathetic, and effective, but we always recommend reviewing and personalizing them before sending."
    },
  ];

  // Video tutorials
  const videoTutorials = [
    {
      title: "Getting Started with RepuRadar",
      description: "Learn the basics of setting up your account and connecting your first review platform.",
      duration: "5:32",
      thumbnail: "https://example.com/thumbnail1.jpg"
    },
    {
      title: "Managing Multiple Locations",
      description: "How to add and manage multiple business locations effectively.",
      duration: "4:18",
      thumbnail: "https://example.com/thumbnail2.jpg"
    },
    {
      title: "Using AI Response Suggestions",
      description: "Get the most out of our AI-powered review response feature.",
      duration: "6:45",
      thumbnail: "https://example.com/thumbnail3.jpg"
    },
    {
      title: "Setting Up Review Requests",
      description: "Learn how to create templates and send review requests to your customers.",
      duration: "7:21",
      thumbnail: "https://example.com/thumbnail4.jpg"
    },
    {
      title: "Understanding Analytics Dashboard",
      description: "How to interpret your review data and gain actionable insights.",
      duration: "8:10",
      thumbnail: "https://example.com/thumbnail5.jpg"
    },
    {
      title: "Competitor Analysis Walkthrough",
      description: "Set up competitor tracking and compare your performance.",
      duration: "5:54",
      thumbnail: "https://example.com/thumbnail6.jpg"
    },
  ];

  // Knowledge base articles (for demo)
  const knowledgeBaseArticles = [
    {
      id: 1,
      title: "Complete Guide to Setting Up Your Account",
      category: "Getting Started",
      tags: ["setup", "account", "onboarding"],
      content: `
# Complete Guide to Setting Up Your Account

Welcome to RepuRadar! This guide will walk you through the complete setup process for your new account.

## Step 1: Complete Your Profile
After signing up, the first thing you should do is complete your profile information. This helps us personalize your experience and ensures you get the most relevant insights.

## Step 2: Add Your First Location
Go to Settings > Locations and click "Add Location" to set up your first business location. Make sure to include:
- Business name
- Physical address
- Phone number
- Business category

## Step 3: Connect Review Platforms
Head to the Integrations page to connect your review platforms:
- Google My Business
- Yelp
- Facebook
- Apple Maps

## Step 4: Set Up Alerts
Configure your notification preferences to stay informed about new reviews, especially negative ones that might require immediate attention.

## Step 5: Create Review Request Templates
Set up templates to easily request reviews from your customers via email or SMS.

## Next Steps
Once your account is set up, explore the dashboard to see your current review status and begin monitoring your online reputation.
      `
    },
    {
      id: 2,
      title: "Responding to Negative Reviews: Best Practices",
      category: "Review Management",
      tags: ["negative reviews", "customer service", "response"],
      content: `
# Responding to Negative Reviews: Best Practices

Negative reviews can be challenging to address, but they also present an opportunity to demonstrate your commitment to customer satisfaction.

## The 24-Hour Rule
Aim to respond to negative reviews within 24 hours. This shows that you take customer feedback seriously and are committed to resolving issues promptly.

## Key Elements of an Effective Response
1. **Thank the reviewer** for their feedback
2. **Apologize** for their negative experience
3. **Take responsibility** without making excuses
4. **Explain what you're doing** to address the issue
5. **Take the conversation offline** by providing contact information
6. **Keep it professional** and avoid emotional reactions

## Using AI Response Suggestions
RepuRadar's AI can help you craft professional responses. To use this feature:
1. Navigate to the review in question
2. Click "Generate AI Response"
3. Customize the suggestion to add your personal touch
4. Review and post your response

## Follow-Up Actions
After responding publicly:
- Contact the customer directly if possible
- Document the issue internally
- Implement changes to prevent similar issues
- Monitor for a response from the customer

Remember, how you handle negative reviews can turn an unhappy customer into a loyal advocate.
      `
    },
  ];

  // Handle article selection
  const viewArticle = (article: any) => {
    setSelectedArticle(article);
  };

  // Handle back to search results
  const backToResults = () => {
    setSelectedArticle(null);
  };

  return (
    <>
      <Helmet>
        <title>Help & Support | RepuRadar</title>
        <meta name="description" content="Get support, search the knowledge base, and find answers to your questions about RepuRadar." />
      </Helmet>
      
      <DashboardLayout>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">Help & Support</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>
                    Search our documentation for quick answers to your questions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...searchForm}>
                    <form 
                      onSubmit={searchForm.handleSubmit(onSearchSubmit)} 
                      className="flex w-full max-w-lg items-center space-x-2"
                    >
                      <FormField
                        control={searchForm.control}
                        name="query"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input 
                                  placeholder="Search for help articles..." 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit"
                        disabled={searchKnowledgeBaseMutation.isPending}
                      >
                        {searchKnowledgeBaseMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Search'
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  {/* Search Results or Selected Article */}
                  {selectedArticle ? (
                    <div className="mt-6">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={backToResults}
                        className="mb-4"
                      >
                        ← Back to results
                      </Button>
                      
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <h1>{selectedArticle.title}</h1>
                        <div className="flex items-center space-x-2 mb-4">
                          <Badge>{selectedArticle.category}</Badge>
                          {selectedArticle.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br>') }} />
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="mt-6 space-y-4">
                      <h3 className="font-medium">Search Results ({searchResults.length})</h3>
                      <div className="space-y-2">
                        {knowledgeBaseArticles.map((article) => (
                          <div 
                            key={article.id}
                            className="border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => viewArticle(article)}
                          >
                            <h4 className="font-medium">{article.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className="text-xs">{article.category}</Badge>
                              {article.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                              {article.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">+{article.tags.length - 2} more</Badge>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <FileText className="h-3 w-3 mr-1" /> Article
                              <Button variant="link" size="sm" className="p-0 ml-auto h-auto">
                                Read More <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <Tabs defaultValue="faq">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="faq">FAQ</TabsTrigger>
                          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
                          <TabsTrigger value="guides">Guides</TabsTrigger>
                        </TabsList>
                        <TabsContent value="faq" className="mt-4">
                          <Accordion type="single" collapsible className="w-full">
                            {faqItems.map((item, index) => (
                              <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>
                                  <div className="flex items-start text-left">
                                    <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                                    <span>{item.question}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <p className="pl-7">{item.answer}</p>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </TabsContent>
                        <TabsContent value="videos" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {videoTutorials.map((video, index) => (
                              <Card key={index} className="overflow-hidden">
                                <div className="aspect-video relative bg-slate-100 flex items-center justify-center">
                                  {/* Placeholder for video thumbnail */}
                                  <Play className="h-12 w-12 text-primary opacity-80" />
                                </div>
                                <CardContent className="pt-4">
                                  <h3 className="font-medium">{video.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <Badge variant="outline">{video.duration}</Badge>
                                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                                      Watch <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="guides" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {knowledgeBaseArticles.map((article) => (
                              <Card key={article.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <CardHeader className="p-4 pb-2">
                                  <CardTitle className="text-base">{article.title}</CardTitle>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge className="text-xs">{article.category}</Badge>
                                  </div>
                                </CardHeader>
                                <CardFooter className="p-4 pt-2 flex justify-between">
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <FileText className="h-3 w-3 mr-1" /> Guide
                                  </div>
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 h-auto"
                                    onClick={() => viewArticle(article)}
                                  >
                                    Read Guide <ChevronRight className="h-3 w-3 ml-1" />
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right column with contact info and support ticket form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>Reach our support team through these channels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h4 className="font-medium">Email Support</h4>
                      <p className="text-sm text-muted-foreground">support@repuradar.com</p>
                      <p className="text-xs text-muted-foreground mt-1">Responses within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h4 className="font-medium">Phone Support</h4>
                      <p className="text-sm text-muted-foreground">+1 (800) 555-0123</p>
                      <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9am-5pm EST</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <h4 className="font-medium">Live Chat</h4>
                      <p className="text-sm text-muted-foreground">Available on website</p>
                      <p className="text-xs text-muted-foreground mt-1">Business hours only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Ticket</CardTitle>
                  <CardDescription>We'll respond to your inquiry as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                  {ticketSubmitted ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Ticket Submitted</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Thank you for reaching out. Our support team will get back to you within 24 hours.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setTicketSubmitted(false)}
                      >
                        Submit Another Ticket
                      </Button>
                    </div>
                  ) : (
                    <Form {...ticketForm}>
                      <form onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-4">
                        <FormField
                          control={ticketForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Brief description of your issue" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={ticketForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="technical">Technical Issue</SelectItem>
                                  <SelectItem value="billing">Billing</SelectItem>
                                  <SelectItem value="account">Account</SelectItem>
                                  <SelectItem value="feature">Feature Request</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={ticketForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please describe your issue in detail"
                                  className="min-h-[120px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={ticketForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Please select an appropriate priority level for your issue
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={submitTicketMutation.isPending}
                        >
                          {submitTicketMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting
                            </>
                          ) : (
                            'Submit Ticket'
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};