import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  Search, 
  ThumbsDown, 
  ThumbsUp, 
  MessageSquareQuote, 
  RefreshCw, 
  Flag, 
  Copy, 
  Edit,
  X,
  Sparkles
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";

interface Review {
  id: number;
  userId: number;
  customerId: number;
  locationId: number;
  platform: string;
  rating: number;
  reviewText: string;
  responseText?: string | null;
  reviewDate: string;
  responseDate?: string | null;
  sentiment: "positive" | "neutral" | "negative";
  needsResponse: boolean;
  customerName: string;
  businessName: string;
  reviewUrl?: string;
}

interface SentimentStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  needsResponse: number;
  responseRate: number;
}

export default function AdminReviewsPage() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState("professional");
  
  // Fetch reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
  });
  
  // Fetch sentiment stats
  const { data: sentimentStats, isLoading: isLoadingStats } = useQuery<SentimentStats>({
    queryKey: ["/api/admin/reviews/sentiment-stats"],
  });
  
  // Mock AI-generated response for demo
  const generateAiResponse = () => {
    setIsAiGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let response = "";
      
      if (selectedReview) {
        const isPositive = selectedReview.sentiment === "positive";
        const isNeutral = selectedReview.sentiment === "neutral";
        
        if (selectedTone === "professional") {
          if (isPositive) {
            response = "Thank you for your wonderful feedback! We're delighted that you had such a positive experience with our services. We value your business and look forward to serving you again soon.";
          } else if (isNeutral) {
            response = "Thank you for your feedback. We appreciate you taking the time to share your experience with us. If there's anything we can do to make your next visit even better, please don't hesitate to let us know.";
          } else {
            response = "Thank you for bringing this to our attention. We apologize for any inconvenience you experienced. We take all feedback seriously and would like to make things right. Please contact our customer service team directly so we can address your concerns promptly.";
          }
        } else if (selectedTone === "friendly") {
          if (isPositive) {
            response = "Wow, thanks so much for the amazing review! 😊 We're super happy you had a great time with us. Can't wait to see you again soon!";
          } else if (isNeutral) {
            response = "Hey there, thanks for your feedback! We're always looking to improve, so we really appreciate you taking the time to share your thoughts with us. Hope to see you again soon!";
          } else {
            response = "Hi there - we're really sorry to hear about your experience. 😔 That's definitely not what we aim for! We'd love to make this right for you. Could you reach out to us directly so we can help sort this out?";
          }
        } else if (selectedTone === "formal") {
          if (isPositive) {
            response = "We sincerely appreciate your positive feedback regarding our services. It is our continuing mission to provide exceptional experiences for all our valued clients. We look forward to maintaining the high standards you have recognized in your review.";
          } else if (isNeutral) {
            response = "We acknowledge receipt of your feedback and thank you for taking the time to share your experience. Your input is valuable to our ongoing service improvement efforts. We would welcome any additional suggestions you might have.";
          } else {
            response = "We extend our sincere apologies for the unsatisfactory experience you have described. Customer satisfaction is of paramount importance to our organization. We kindly request that you contact our customer relations department at your earliest convenience so that we may address your concerns appropriately.";
          }
        }
      }
      
      setResponseText(response);
      setIsAiGenerating(false);
    }, 1500);
  };
  
  // Filter and sort reviews
  const filteredReviews = reviews
    ? reviews.filter(review => {
        // Tab filter
        const matchesTab = 
          (selectedTab === "all") ||
          (selectedTab === "positive" && review.sentiment === "positive") ||
          (selectedTab === "neutral" && review.sentiment === "neutral") ||
          (selectedTab === "negative" && review.sentiment === "negative") ||
          (selectedTab === "needs-response" && review.needsResponse);
        
        // Platform filter
        const matchesPlatform = 
          platformFilter === "all" || 
          review.platform.toLowerCase() === platformFilter.toLowerCase();
        
        // Text search
        const matchesSearch = 
          searchQuery === "" ||
          review.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.businessName.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesTab && matchesPlatform && matchesSearch;
      })
    : [];
    
  // Sort the filtered reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
    } else if (sortBy === "rating") {
      return b.rating - a.rating;
    } else if (sortBy === "sentiment") {
      const sentimentValue = {
        positive: 3,
        neutral: 2,
        negative: 1
      };
      return sentimentValue[b.sentiment] - sentimentValue[a.sentiment];
    }
    return 0;
  });
  
  const handleViewResponse = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.responseText || "");
  };
  
  const handleCloseDrawer = () => {
    setSelectedReview(null);
    setResponseText("");
  };
  
  const renderSentimentBadge = (sentiment: string) => {
    if (sentiment === "positive") {
      return (
        <Badge className="bg-green-500 text-white flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          Positive
        </Badge>
      );
    } else if (sentiment === "neutral") {
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500 flex items-center gap-1">
          <span className="h-3 w-3">•</span>
          Neutral
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ThumbsDown className="h-3 w-3" />
          Negative
        </Badge>
      );
    }
  };
  
  const renderPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    
    if (platformLower === "google") {
      return "G";
    } else if (platformLower === "yelp") {
      return "Y";
    } else if (platformLower === "facebook") {
      return "F";
    } else if (platformLower === "tripadvisor") {
      return "T";
    } else {
      return platform.charAt(0).toUpperCase();
    }
  };
  
  return (
    <AdminLayout pageTitle="Review Oversight">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Review Oversight</h2>
            <p className="text-muted-foreground">
              Monitor and manage customer reviews across all platforms
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm hidden md:inline-block">
              Last synced:
            </span>
            <span className="text-sm font-medium hidden md:inline-block">
              {new Date().toLocaleString()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Sentiment Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {sentimentStats?.total || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                From all connected platforms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-600">
                    {sentimentStats 
                      ? Math.round((sentimentStats.positive / Math.max(sentimentStats.total, 1)) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs text-green-600 flex items-center">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Positive
                  </div>
                </div>
              )}
              <div className="mt-2">
                <Progress 
                  value={sentimentStats 
                    ? (sentimentStats.positive / Math.max(sentimentStats.total, 1)) * 100
                    : 0
                  } 
                  className="h-1.5"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {sentimentStats?.responseRate || 0}%
                </div>
              )}
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  {sentimentStats?.needsResponse || 0} reviews need response
                </p>
                <Badge variant="outline" className="text-xs">
                  Target: 90%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Platform Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs">Google (45%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs">Yelp (25%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-700"></div>
                    <span className="text-xs">Facebook (20%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">Others (10%)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Reviews Table with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Review Management</CardTitle>
            <CardDescription>
              View, filter and respond to customer reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    All Reviews
                  </TabsTrigger>
                  <TabsTrigger value="positive" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Positive
                  </TabsTrigger>
                  <TabsTrigger value="neutral" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                    Neutral
                  </TabsTrigger>
                  <TabsTrigger value="negative" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Negative
                  </TabsTrigger>
                  <TabsTrigger value="needs-response" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    <MessageSquareQuote className="h-4 w-4 mr-1" />
                    Needs Response
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search reviews..."
                      className="w-full sm:w-[200px] pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="w-[130px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="yelp">Yelp</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Latest First</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="sentiment">Sentiment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <TabsContent value="all" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Rating</TableHead>
                        <TableHead className="w-[120px]">Platform</TableHead>
                        <TableHead className="w-[180px]">Customer</TableHead>
                        <TableHead className="w-[180px]">Business</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead className="w-[140px]">Sentiment</TableHead>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingReviews ? (
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-8 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : sortedReviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No reviews found matching your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedReviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell>
                              <div className="flex text-amber-500">
                                {Array(5).fill(0).map((_, i) => (
                                  <span key={i} className={i < review.rating ? "text-amber-500" : "text-gray-300"}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                                  {renderPlatformIcon(review.platform)}
                                </div>
                                <span className="text-sm">{review.platform}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate max-w-[120px]">
                                  {review.customerName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm truncate max-w-[140px] block">
                                {review.businessName}
                              </span>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm truncate max-w-[300px]">
                                {review.reviewText}
                              </p>
                            </TableCell>
                            <TableCell>
                              {renderSentimentBadge(review.sentiment)}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(review.reviewDate).toLocaleDateString()}
                              </div>
                              {review.needsResponse && (
                                <Badge 
                                  variant="outline" 
                                  className="border-red-500 text-red-500 text-xs mt-1"
                                >
                                  Needs response
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleViewResponse(review)}
                              >
                                <MessageSquareQuote className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              {/* Other tab contents would be identical to the "all" tab above */}
              <TabsContent value="positive">
                <div className="text-center py-8 text-muted-foreground">
                  <ThumbsUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>This tab shows the same table filtered for positive reviews only</p>
                </div>
              </TabsContent>
              
              <TabsContent value="neutral">
                <div className="text-center py-8 text-muted-foreground">
                  <p>This tab shows the same table filtered for neutral reviews only</p>
                </div>
              </TabsContent>
              
              <TabsContent value="negative">
                <div className="text-center py-8 text-muted-foreground">
                  <ThumbsDown className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>This tab shows the same table filtered for negative reviews only</p>
                </div>
              </TabsContent>
              
              <TabsContent value="needs-response">
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquareQuote className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>This tab shows the same table filtered for reviews that need responses</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Drawer for Response View/Edit */}
        {selectedReview && (
          <Drawer 
            open={!!selectedReview} 
            onOpenChange={(open) => !open && handleCloseDrawer()}
          >
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader>
                <DrawerTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Review Response</span>
                    {renderSentimentBadge(selectedReview.sentiment)}
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </DrawerTitle>
                <DrawerDescription>
                  {selectedReview.businessName} • {selectedReview.platform} • {new Date(selectedReview.reviewDate).toLocaleDateString()}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 overflow-y-auto">
                <div className="space-y-4 pb-4">
                  {/* Review Display */}
                  <Card className="border-muted">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{selectedReview.customerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-sm font-medium">{selectedReview.customerName}</h4>
                            <div className="flex text-amber-500 text-xs">
                              {Array(5).fill(0).map((_, i) => (
                                <span key={i} className={i < selectedReview.rating ? "text-amber-500" : "text-gray-300"}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex text-xs text-muted-foreground">
                          {new Date(selectedReview.reviewDate).toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line">{selectedReview.reviewText}</p>
                    </CardContent>
                  </Card>
                  
                  {/* Response Editor */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Response</h4>
                      <div className="flex items-center gap-2">
                        <Select value={selectedTone} onValueChange={setSelectedTone}>
                          <SelectTrigger className="h-8 text-xs w-[120px]">
                            <SelectValue placeholder="Tone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1 h-8 text-xs" 
                          onClick={generateAiResponse}
                          disabled={isAiGenerating}
                        >
                          {isAiGenerating ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              Generate AI Response
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <Textarea 
                      placeholder="Write a response to this review..."
                      className="min-h-[120px]"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs gap-1"
                          onClick={() => {
                            navigator.clipboard.writeText(responseText);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                        {selectedReview.responseText && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs text-red-500 hover:text-red-600 gap-1"
                          >
                            <Flag className="h-3 w-3" />
                            Flag for Review
                          </Button>
                        )}
                      </div>
                      
                      <Button size="sm" className="gap-1">
                        <Edit className="h-3 w-3" />
                        {selectedReview.responseText ? 'Update Response' : 'Post Response'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <DrawerFooter>
                <div className="text-xs text-muted-foreground text-center">
                  Customers are notified when you respond to their reviews
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </AdminLayout>
  );
}