import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
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
import { Helmet } from 'react-helmet';

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

const HelpPage = () => {
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
      answer: "Go to the Integrations page and select the Google Places tab. You\'ll need to enter your Google Place ID and API key. You can find your Place ID using Google\'s Place ID Finder tool. For the API key, you\'ll need to create one in the Google Cloud Console with the Places API enabled."
    },
    {
      id: "review-response",
      question: "Can I respond to reviews directly from Reputation Sentinel?",
      answer: (
        <>
          <p>
            Yes, Reputation Sentinel allows you to respond to reviews from connected platforms (like Google My Business) directly through the dashboard. For platforms that don\'t support direct API responses, we provide guidance and make it easy to navigate to the platform to respond.
          </p>
        </>
      )
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
      question: "What\'s the difference between the various subscription plans?",
      answer: "Our Free plan includes basic review monitoring for one location. The Pro plan adds multiple locations, advanced analytics, and AI response suggestions. The Business plan includes unlimited locations, white-label reporting, and API access. View the complete comparison on the Profile > Billing page."
    },
    {
      question: "Can I track my competitors\' reviews?",
      answer: "Yes, with our Competitor Analysis feature, you can monitor your competitors\' ratings and reviews across all platforms. Simply add a competitor on the Competitors page and provide their business information or platform IDs."
    },
    {
      question: "How accurate are the AI-generated response suggestions?",
      answer: "Our AI responses are powered by OpenAI\'s advanced language models and are tailored to your business type and the specific review content. They\'re designed to be professional, empathetic, and effective, but we always recommend reviewing and personalizing them before sending."
    },
  ];

  // Video tutorials
  const videoTutorials = [
    {
      id: "getting-started",
      title: "Getting Started with Reputation Sentinel",
      description: "Learn the basics of setting up your account and connecting your first review platform.",
      duration: "5:32",
      thumbnail: "https://example.com/thumbnail1.jpg" // Placeholder
    },
    {
      title: "Managing Multiple Locations",
      description: "How to add and manage multiple business locations effectively.",
      duration: "4:18",
      thumbnail: "https://example.com/thumbnail2.jpg" // Placeholder
    },
    {
      title: "Using AI Response Suggestions",
      description: "Get the most out of our AI-powered review response feature.",
      duration: "6:45",
      thumbnail: "https://example.com/thumbnail3.jpg" // Placeholder
    },
    {
      title: "Setting Up Review Requests",
      description: "Learn how to create templates and send review requests to your customers.",
      duration: "7:21",
      thumbnail: "https://example.com/thumbnail4.jpg" // Placeholder
    },
    {
      title: "Understanding Analytics Dashboard",
      description: "How to interpret your review data and gain actionable insights.",
      duration: "8:10",
      thumbnail: "https://example.com/thumbnail5.jpg" // Placeholder
    },
    {
      title: "Competitor Analysis Walkthrough",
      description: "Set up competitor tracking and compare your performance.",
      duration: "5:54",
      thumbnail: "https://example.com/thumbnail6.jpg" // Placeholder
    },
  ];

  // Knowledge base articles (for demo)
  const knowledgeBaseArticles = [
    {
      id: 1,
      title: "Complete Guide to Setting Up Your Account",
      category: "Getting Started",
      tags: ["setup", "account", "onboarding"],
      content: (
        <>
          <h2 className="text-2xl font-semibold mb-4">Welcome to Reputation Sentinel!</h2>
          <p className="mb-4">
            Welcome to Reputation Sentinel! This guide will walk you through the complete setup process for your new account.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-2">1. Complete Your Profile</h3>
          <p className="mb-4">
            After signing up, the first thing you should do is complete your profile information. This helps us personalize your experience and ensures you get the most relevant insights. Go to <strong>Profile Settings</strong> from the sidebar.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-2">2. Add Your First Location</h3>
          <p className="mb-4">
            Navigate to <strong>Settings {'>'} Locations</strong> and click "Add Location" to set up your first business location. Make sure to include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Business name</li>
            <li>Physical address</li>
            <li>Phone number</li>
            <li>Business category</li>
            <li>(Optional) Google Place ID, Yelp Business ID, Facebook Page ID for direct integration.</li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-2">3. Connect Review Platforms</h3>
          <p className="mb-4">
            Go to <strong>Integrations</strong>. For each platform (Google, Yelp, Facebook, etc.), follow the instructions to connect your accounts. This usually involves providing an API key or authorizing Reputation Sentinel to access your data.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-2">4. Responding to Reviews</h3>
          <p className="mb-4">
            Reputation Sentinel's AI can help you craft professional responses. To use this feature:
          </p>
          <ol className="list-decimal pl-6 mb-4 space-y-1">
            <li>Navigate to the <strong>Reviews</strong> page.</li>
            <li>Find the review you want to respond to.</li>
            <li>Click "Generate AI Response".</li>
            <li>Review and edit the suggestion, then click "Send Response" or copy the text to respond manually on the platform.</li>
          </ol>
          <h3 className="text-xl font-semibold mt-6 mb-2">5. Explore Other Features</h3>
          <p>
            Don\'t forget to check out:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Analytics:</strong> To track your review performance.</li>
            <li><strong>Review Requests:</strong> To solicit new reviews.</li>
            <li><strong>Competitors:</strong> To monitor your competition.</li>
            <li><strong>Alerts:</strong> To stay updated on important review activity.</li>
          </ul>
        </>
      )
    },
    // Add more articles as needed
  ];

  const viewArticle = (article: any) => {
    setSelectedArticle(article);
  };

  const backToResults = () => {
    setSelectedArticle(null);
  };

  return (
    <>
      <Helmet>
        <title>Help & Support | Reputation Sentinel</title>
        <meta name="description" content="Get support, search the knowledge base, and find answers to your questions about Reputation Sentinel." />
      </Helmet>
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Help & Support Center</h1>

        <Tabs defaultValue="knowledge-base" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
          </TabsList>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge-base" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>
                  Find articles, guides, and tutorials to help you get the most out of Reputation Sentinel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedArticle ? (
                  <>
                    <Form {...searchForm}>
                      <form onSubmit={searchForm.handleSubmit(onSearchSubmit)} className="flex gap-2 mb-6">
                        <FormField
                          control={searchForm.control}
                          name="query"
                          render={({ field }) => (
                            <FormItem className="flex-grow">
                              <FormControl>
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <Input placeholder="Search articles..." className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={searchKnowledgeBaseMutation.isPending}>
                          {searchKnowledgeBaseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Search
                        </Button>
                      </form>
                    </Form>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(searchResults.length > 0 ? searchResults : knowledgeBaseArticles).map((article) => (
                        <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col" onClick={() => viewArticle(article)}>
                          <CardHeader>
                            <CardTitle className="text-lg">{article.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {typeof article.content === 'string' ? article.content.substring(0, 150) + "..." : "Click to read more."}
                            </p>
                          </CardContent>
                          <CardFooter className="text-sm text-muted-foreground">
                            Category: {article.category}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <Button variant="outline" onClick={backToResults} className="mb-4">
                      <ArrowRight className="mr-2 h-4 w-4 transform rotate-180" /> Back to Search Results
                    </Button>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                        <CardDescription>Category: {selectedArticle.category} {selectedArticle.tags && selectedArticle.tags.map((tag: string) => (<Badge key={tag} variant="outline" className="ml-1">{tag}</Badge>))}</CardDescription>
                      </CardHeader>
                      <CardContent className="prose max-w-none">
                        {typeof selectedArticle.content === 'string' ? <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} /> : selectedArticle.content}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Watch step-by-step guides to get the most out of Reputation Sentinel.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoTutorials.map((video) => (
                  <Card key={video.title} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {/* In a real app, this would be an iframe or video player */}
                      <img src={video.thumbnail} alt={video.title} className="object-cover w-full h-full" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-base">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>{video.description}</p>
                      <p className="mt-1">Duration: {video.duration}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        <Play className="h-4 w-4 mr-2" /> Watch Video
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions about using Reputation Sentinel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="prose max-w-none">
                        {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Us Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Can\'t find what you\'re looking for? Reach out to our support team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!ticketSubmitted ? (
                  <Form {...ticketForm}>
                    <form onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-6">
                      <FormField
                        control={ticketForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Issue with Google integration" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={ticketForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="technical">Technical Issue</SelectItem>
                                  <SelectItem value="billing">Billing Inquiry</SelectItem>
                                  <SelectItem value="feature-request">Feature Request</SelectItem>
                                  <SelectItem value="general">General Question</SelectItem>
                                </SelectContent>
                              </Select>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={ticketForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your issue or question in detail..."
                                className="min-h-[150px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Please provide as much detail as possible, including steps to reproduce if it\'s a technical issue.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={submitTicketMutation.isPending}>
                        {submitTicketMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Ticket
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-green-50 rounded-md">
                    <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-green-700">Support Ticket Submitted!</h3>
                    <p className="text-muted-foreground mb-4">
                      Thank you for contacting us. We have received your ticket and a member of our support team will get back to you shortly.
                    </p>
                    <Button onClick={() => setTicketSubmitted(false)}>Submit Another Ticket</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="mailto:support@reputationsentinel.com"
                  className="flex items-center p-4 border rounded-lg hover:bg-muted transition-colors"
                  aria-label="Email our support team"
                >
                  <Mail className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <span className="text-sm text-muted-foreground">support@reputationsentinel.com</span>
                  </div>
                </a>
                <div className="flex items-center p-4 border rounded-lg" aria-label="Call our support line">
                  <Phone className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Phone Support (Pro & Business)</p>
                    <span className="text-sm text-muted-foreground">+1 (800) 555-0123</span>
                  </div>
                </div>
                {/* Future Live Chat option
                <div className="flex items-center p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer" aria-label="Start a live chat session">
                  <MessageSquare className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <span className="text-sm text-muted-foreground">Usually replies within 5 minutes</span>
                  </div>
                </div>
                */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default HelpPage;