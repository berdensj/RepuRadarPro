import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Search, 
  MessageSquareText, 
  ChevronRight, 
  Bookmark, 
  ArrowLeft,
  ChevronUp,
  MessageCircle,
  Loader2 
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import SidebarLayout from "@/components/layout/sidebar-layout";

// Define form validation schema
const supportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

// Mock FAQ categories and questions
const faqCategories = [
  {
    id: 1,
    title: "Getting Started",
    questions: [
      {
        id: 1,
        question: "How do I set up my account?",
        answer: "To set up your account, follow these simple steps: 1) Complete your profile information with business details 2) Connect your review platforms 3) Set up your notification preferences 4) Invite team members if needed."
      },
      {
        id: 2,
        question: "How do I connect my Google Business Profile?",
        answer: "To connect your Google Business Profile, go to Integrations > Google and click 'Connect'. You'll be guided through the authentication process and will need to select which locations you want to monitor."
      },
      {
        id: 3,
        question: "Can I monitor multiple business locations?",
        answer: "Yes! Depending on your subscription plan, you can monitor multiple business locations. Go to Settings > Locations to add and manage your locations. Each location can be configured separately with its own set of platforms and notification preferences."
      }
    ]
  },
  {
    id: 2,
    title: "Review Management",
    questions: [
      {
        id: 4,
        question: "How do I respond to reviews?",
        answer: "Navigate to the Reviews page, find the review you want to respond to, and click 'Respond'. You can either use one of our AI-generated response suggestions or write your own. All responses will be posted to the original review platform."
      },
      {
        id: 5,
        question: "Can I create response templates?",
        answer: "Yes! Go to Templates > Response Templates to create, edit and manage your templates. You can create different templates for positive, neutral, and negative reviews. These templates can be used when responding to reviews manually or can help guide the AI in generating more personalized responses."
      },
      {
        id: 6,
        question: "How often are new reviews imported?",
        answer: "New reviews are imported automatically every 6 hours. You can also manually refresh your reviews by clicking 'Refresh Reviews' on the Reviews page."
      }
    ]
  },
  {
    id: 3,
    title: "Analytics & Reporting",
    questions: [
      {
        id: 7,
        question: "How is the sentiment score calculated?",
        answer: "Our sentiment score uses advanced AI to analyze the text of reviews, looking beyond just star ratings. It considers language nuances, identified themes, and comparison with historical patterns. The score ranges from 0-100, with higher scores indicating more positive sentiment."
      },
      {
        id: 8,
        question: "Can I export reports?",
        answer: "Yes, you can export reports in multiple formats including PDF, CSV, and Excel. Navigate to the Reports page, select your desired report parameters, generate the report, and click 'Export' to download in your preferred format."
      },
      {
        id: 9,
        question: "How do I schedule automated reports?",
        answer: "Go to Reports > Scheduled Reports and click 'Create Schedule'. You can set the frequency (daily, weekly, monthly), select recipients, choose report content, and customize the delivery time. Reports will be automatically generated and emailed to all recipients."
      }
    ]
  },
  {
    id: 4,
    title: "Billing & Subscriptions",
    questions: [
      {
        id: 10,
        question: "How do I upgrade my plan?",
        answer: "To upgrade your subscription, go to Subscription > Plans, select your desired plan, and follow the payment instructions. Your account will be immediately upgraded with the new features available right away."
      },
      {
        id: 11,
        question: "What happens when my trial ends?",
        answer: "When your 14-day trial ends, your account will automatically switch to our Free plan with limited features. To maintain full functionality, upgrade to a paid plan before the trial period ends. You'll receive email reminders as the end date approaches."
      },
      {
        id: 12,
        question: "How do I update my billing information?",
        answer: "Navigate to Subscription > Billing Information where you can update your payment method, billing address, and contact information. Changes take effect immediately for your next billing cycle."
      }
    ]
  },
];

// Mock knowledge base articles
const kbArticles = [
  {
    id: 1,
    title: "Getting Started with Reputation Sentinel",
    category: "Onboarding",
    summary: "Learn how to set up your account and get started with Reputation Sentinel's key features.",
    content: "This comprehensive guide walks you through everything you need to know to get started with Reputation Sentinel. From completing your profile to connecting review platforms, setting up notifications, and inviting team members, you'll learn how to configure your account for optimal performance.\n\nWe recommend starting with connecting your most important review platforms, then setting up alert preferences for negative reviews. This ensures you can immediately respond to customer concerns while you continue setting up the rest of your account features."
  },
  {
    id: 2,
    title: "Managing Multiple Business Locations",
    category: "Configuration",
    summary: "Learn how to effectively organize and manage multiple business locations within Reputation Sentinel.",
    content: "This article explains how to add, organize, and manage multiple business locations in Reputation Sentinel. You'll learn how to create location groups, assign managers to specific locations, configure location-specific settings, and view aggregated data across all locations.\n\nBy properly organizing your locations, you'll be able to track performance metrics individually or as groups, allowing both granular and high-level views of your online reputation. Each location can have its own set of connected platforms, notification settings, and response templates."
  },
  {
    id: 3,
    title: "Understanding Sentiment Analysis",
    category: "Analytics",
    summary: "Deep dive into how Reputation Sentinel's sentiment analysis works and how to interpret the results.",
    content: "This article explains the technology behind Reputation Sentinel's advanced sentiment analysis system. Our AI doesn't just count stars—it reads and understands the actual content of reviews, identifying key themes, emotional indicators, and contextual nuances.\n\nYou'll learn how to interpret the sentiment score (0-100), how to track sentiment trends over time, and how to identify specific aspects of your business that are affecting sentiment. We also explain how our theme detection works to categorize feedback into actionable insights about your products, services, staff, and customer experience."
  },
  {
    id: 4,
    title: "Best Practices for Responding to Negative Reviews",
    category: "Reviews",
    summary: "Learn effective strategies for handling negative reviews to improve customer satisfaction.",
    content: "This guide provides proven strategies for responding to negative reviews in a way that can turn unhappy customers into loyal advocates. You'll learn the psychology behind customer complaints, the right tone to use in responses, and how to create solutions that address the root causes of negative feedback.\n\nWe cover important topics like response timing (aim for under 24 hours), acknowledgment without defensiveness, taking the conversation private when appropriate, and following up to ensure resolution. The article includes real examples of effective responses that have successfully converted negative situations into positive outcomes."
  },
  {
    id: 5,
    title: "Creating Effective Review Request Campaigns",
    category: "Marketing",
    summary: "Learn how to design and implement successful review request campaigns to increase positive reviews.",
    content: "This article guides you through creating review request campaigns that generate authentic, positive reviews without violating platform policies. You'll learn how to identify the right moments in the customer journey to request reviews, how to craft messages that encourage action, and how to automate the process while maintaining a personal touch.\n\nWe cover important considerations like timing, message personalization, follow-up sequences, and compliance with review platform guidelines. You'll also learn how to track campaign performance and optimize your approach based on response rates."
  },
];

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState("faq");
  
  // Set up form
  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });
  
  // Form submission handler
  const onSubmit = (data: SupportFormValues) => {
    // In a real app, this would send the data to a backend API
    console.log(data);
    // Show success message
    alert("Your support request has been submitted. We'll get back to you soon!");
    form.reset();
  };
  
  // Filter KB articles based on search term
  const filteredArticles = kbArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle article click
  const viewArticle = (article: any) => {
    setSelectedArticle(article);
  };
  
  // Handle back to search results
  const backToResults = () => {
    setSelectedArticle(null);
  };

  return (
    <div>
      <Helmet>
        <title>Help & Support | RepuRadar</title>
        <meta name="description" content="Get support, search the knowledge base, and find answers to your questions about RepuRadar." />
      </Helmet>
      
      <div className="space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support Center</CardTitle>
                <CardDescription>Find answers to your questions or contact our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search for help articles, FAQs, or topics..." 
                    className="pl-9" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="faq">
                  <FileText className="h-4 w-4 mr-2" />
                  FAQs
                </TabsTrigger>
                <TabsTrigger value="kb">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Knowledge Base
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <MessageSquareText className="h-4 w-4 mr-2" />
                  Contact Support
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="faq" className="space-y-4">
                {faqCategories.map(category => (
                  <Card key={category.id}>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map(item => (
                          <AccordionItem key={item.id} value={`item-${item.id}`}>
                            <AccordionTrigger className="text-left font-medium">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-slate-600 dark:text-slate-300">
                                {item.answer}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="kb" className="space-y-4">
                {selectedArticle ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center mb-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1" 
                          onClick={backToResults}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
                          {selectedArticle.category}
                        </div>
                        <CardTitle>{selectedArticle.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        {selectedArticle.content.split('\n\n').map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-8 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Was this article helpful?
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Yes</Button>
                          <Button variant="outline" size="sm">No</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    {searchTerm ? (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Search Results for "{searchTerm}"</h3>
                        {filteredArticles.length > 0 ? (
                          <div className="space-y-3">
                            {filteredArticles.map(article => (
                              <Card key={article.id} className="overflow-hidden">
                                <div 
                                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                  onClick={() => viewArticle(article)}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <div className="font-medium">{article.title}</div>
                                    <div className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                                      {article.category}
                                    </div>
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                    {article.summary}
                                  </p>
                                  <div className="flex items-center text-xs text-slate-500">
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="h-auto p-0 text-primary"
                                    >
                                      Read article
                                      <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-medium">No Results Found</h3>
                            <p className="text-muted-foreground mt-2">
                              We couldn't find any articles matching "{searchTerm}"
                            </p>
                            <div className="mt-6">
                              <Button onClick={() => setActiveTab("contact")}>
                                Contact Support
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium mb-4">Featured Articles</h3>
                        {kbArticles.map(article => (
                          <Card key={article.id} className="overflow-hidden">
                            <div 
                              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              onClick={() => viewArticle(article)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="font-medium">{article.title}</div>
                                <div className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                                  {article.category}
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                {article.summary}
                              </p>
                              <div className="flex items-center text-xs text-slate-500">
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="h-auto p-0 text-primary"
                                >
                                  Read article
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Our Support Team</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
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
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Subject of your inquiry" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please describe your issue in detail..." 
                                  className="min-h-[150px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full">
                          {form.formState.isSubmitting ? (
                            <div className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </div>
                          ) : (
                            'Submit Ticket'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Contact our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full text-primary">
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Live Chat</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Chat with our team Monday-Friday, 9am-5pm EST
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary text-sm mt-1">
                      Start a chat
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full text-primary">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Email Support</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Response time: Within 24 hours
                    </p>
                    <a 
                      href="mailto:support@repuradar.com" 
                      className="text-primary text-sm font-medium mt-1 inline-block hover:underline"
                    >
                      support@repuradar.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Popular Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {kbArticles.slice(0, 3).map(article => (
                    <li key={article.id}>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-left justify-start text-primary"
                        onClick={() => {
                          setActiveTab("kb");
                          viewArticle(article);
                        }}
                      >
                        {article.title}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqCategories[0].questions.slice(0, 3).map(item => (
                    <AccordionItem key={item.id} value={`quick-${item.id}`}>
                      <AccordionTrigger className="text-left font-medium text-sm">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {item.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                <Button 
                  variant="link" 
                  className="mt-2 p-0"
                  onClick={() => setActiveTab("faq")}
                >
                  View all FAQs
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;