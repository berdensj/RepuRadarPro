// No need to import DashboardLayout as the page is already wrapped with SidebarLayout in App.tsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AtSign,
  Bell,
  File,
  Inbox,
  Mail,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  Star,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";

// Types
interface Customer {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  lastContact?: string;
}

interface Message {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl?: string;
  subject: string;
  content: string;
  date: string;
  isRead: boolean;
  attachments: string[];
  category: "inbox" | "sent" | "drafts" | "trash";
  labels: string[];
}

interface Template {
  id: number;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
}

// Form schemas
const newMessageSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message content is required"),
});

const CommunicationsPage = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch messages
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ["/api/communications/messages", selectedFolder],
    queryFn: async () => {
      // Mock messages data
      const messages: Message[] = [
        {
          id: 1,
          customerId: 101,
          customerName: "John Smith",
          customerEmail: "john.smith@example.com",
          customerAvatarUrl: "https://i.pravatar.cc/150?img=1",
          subject: "Question about recent review response",
          content:
            "Hi there,\n\nI wanted to thank you for your thoughtful response to my recent review. I appreciate your attention to detail and the personalized message. I had a quick follow-up question about the promotion you mentioned. Could you please provide more details?\n\nThanks,\nJohn",
          date: "2025-05-10T14:30:00",
          isRead: true,
          attachments: [],
          category: "inbox",
          labels: ["customer", "important"],
        },
        {
          id: 2,
          customerId: 102,
          customerName: "Sarah Johnson",
          customerEmail: "sarah.j@example.com",
          customerAvatarUrl: "https://i.pravatar.cc/150?img=2",
          subject: "New review notification",
          content:
            "Hello,\n\nI recently left a review for your business on Google. Just wanted to let you know in case you wanted to respond. Looking forward to hearing from you.\n\nBest,\nSarah",
          date: "2025-05-09T10:15:00",
          isRead: false,
          attachments: [],
          category: "inbox",
          labels: ["review", "follow-up"],
        },
        {
          id: 3,
          customerId: 103,
          customerName: "David Chen",
          customerEmail: "d.chen@example.com",
          customerAvatarUrl: "https://i.pravatar.cc/150?img=3",
          subject: "Feedback on recent response",
          content:
            "I appreciate your quick response to my review. The explanation was helpful and I better understand the situation now. Thank you for taking the time to address my concerns personally.",
          date: "2025-05-08T16:45:00",
          isRead: true,
          attachments: ["feedback_document.pdf"],
          category: "inbox",
          labels: ["feedback", "resolved"],
        },
        {
          id: 4,
          customerId: 104,
          customerName: "Emma Wilson",
          customerEmail: "emma.w@example.com",
          customerAvatarUrl: "https://i.pravatar.cc/150?img=4",
          subject: "Thanks for your help",
          content:
            "Just wanted to send a quick note to say thank you for addressing my concern so promptly. Your customer service is exceptional!",
          date: "2025-05-07T09:20:00",
          isRead: true,
          attachments: [],
          category: "inbox",
          labels: ["positive", "testimonial"],
        },
        {
          id: 5,
          customerId: 101,
          customerName: "John Smith",
          customerEmail: "john.smith@example.com",
          customerAvatarUrl: "https://i.pravatar.cc/150?img=1",
          subject: "Re: Thank you for your recent visit",
          content:
            "Thank you for reaching out after my visit. I had a great experience and will definitely be returning soon!",
          date: "2025-05-06T11:10:00",
          isRead: false,
          attachments: [],
          category: "inbox",
          labels: ["customer", "positive"],
        },
        {
          id: 6,
          customerId: 102,
          customerName: "Sarah Johnson",
          customerEmail: "sarah.j@example.com",
          customerAvatarUrl: "https://i.pravatar.cc/150?img=2",
          subject: "Response to your inquiry",
          content:
            "Dear Sarah,\n\nThank you for your inquiry about our services. We appreciate your interest and would be happy to provide more information about our offerings. Please let me know if you have any other questions.\n\nBest regards,\nYour Name",
          date: "2025-05-10T09:30:00",
          isRead: true,
          attachments: ["brochure.pdf", "pricing.pdf"],
          category: "sent",
          labels: ["inquiry", "follow-up"],
        },
        {
          id: 7,
          customerId: 103,
          customerName: "David Chen",
          customerEmail: "d.chen@example.com",
          customerAvatarUrl: "https://i.pravatar.cc/150?img=3",
          subject: "Thank you for your feedback",
          content:
            "Dear David,\n\nThank you for taking the time to provide us with your valuable feedback. We're glad to hear that our explanation was helpful and that we were able to address your concerns. Your satisfaction is our top priority.\n\nPlease don't hesitate to reach out if you have any other questions or concerns.\n\nBest regards,\nYour Name",
          date: "2025-05-09T14:20:00",
          isRead: true,
          attachments: [],
          category: "sent",
          labels: ["feedback", "resolved"],
        },
        {
          id: 8,
          customerId: 105,
          customerName: "Michael Brown",
          customerEmail: "michael.b@example.com",
          customerAvatarUrl: "https://i.pravatar.cc/150?img=5",
          subject: "Draft: Upcoming promotion announcement",
          content:
            "Dear Valued Customer,\n\nWe're excited to announce our upcoming summer promotion! From June 1st to June 15th, enjoy special discounts on all our services.\n\n[Add specific promotion details here]\n\nWe look forward to serving you soon.\n\nBest regards,\nYour Name",
          date: "2025-05-10T16:00:00",
          isRead: true,
          attachments: ["promotion_details.docx"],
          category: "drafts",
          labels: ["promotion", "marketing"],
        },
      ];

      // Filter by selected folder
      return {
        messages: messages.filter(
          (message) =>
            message.category === selectedFolder &&
            (searchQuery === "" ||
              message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
              message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              message.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              message.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
        total: messages.length,
        unread: messages.filter((m) => !m.isRead && m.category === "inbox").length,
      };
    },
  });

  // Fetch templates
  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: ["/api/communications/templates"],
    queryFn: async () => {
      // Mock templates data
      const templates: Template[] = [
        {
          id: 1,
          name: "Thank You for Your Review",
          subject: "Thank you for your review!",
          content:
            "Dear {{customer_name}},\n\nThank you for taking the time to leave a review for {{business_name}}. We truly appreciate your feedback and are glad to hear about your experience.\n\n{{custom_message}}\n\nWe look forward to serving you again soon!\n\nBest regards,\n{{user_name}}\n{{business_name}}",
          variables: [
            "customer_name",
            "business_name",
            "custom_message",
            "user_name",
          ],
          category: "review_response",
        },
        {
          id: 2,
          name: "Negative Review Response",
          subject: "Regarding your recent experience",
          content:
            "Dear {{customer_name}},\n\nThank you for sharing your feedback. We're sorry to hear that your experience at {{business_name}} didn't meet your expectations.\n\n{{apology_message}}\n\nWe'd love the opportunity to make things right. Please contact me directly at {{contact_info}} so we can address your concerns personally.\n\nSincerely,\n{{user_name}}\n{{business_name}}",
          variables: [
            "customer_name",
            "business_name",
            "apology_message",
            "contact_info",
            "user_name",
          ],
          category: "review_response",
        },
        {
          id: 3,
          name: "Follow-up After Visit",
          subject: "Thank you for visiting {{business_name}}",
          content:
            "Hello {{customer_name}},\n\nThank you for visiting {{business_name}} recently. We hope you had a great experience with us.\n\nWe value your feedback and would appreciate if you could take a moment to share your thoughts on your recent visit. Your input helps us continue to improve our services.\n\n{{review_request_link}}\n\nThank you for your support!\n\nBest regards,\n{{user_name}}\n{{business_name}}",
          variables: [
            "customer_name",
            "business_name",
            "review_request_link",
            "user_name",
          ],
          category: "follow_up",
        },
        {
          id: 4,
          name: "Appointment Confirmation",
          subject: "Your upcoming appointment with {{business_name}}",
          content:
            "Dear {{customer_name}},\n\nThis is a confirmation of your upcoming appointment with {{business_name}} on {{appointment_date}} at {{appointment_time}}.\n\nIf you need to reschedule or have any questions, please don't hesitate to contact us at {{contact_info}}.\n\nWe look forward to seeing you soon!\n\nBest regards,\n{{user_name}}\n{{business_name}}",
          variables: [
            "customer_name",
            "business_name",
            "appointment_date",
            "appointment_time",
            "contact_info",
            "user_name",
          ],
          category: "appointment",
        },
        {
          id: 5,
          name: "Special Promotion",
          subject: "Special offer for {{customer_name}}",
          content:
            "Hello {{customer_name}},\n\nAs a valued customer of {{business_name}}, we're pleased to offer you a special promotion!\n\n{{promotion_details}}\n\nThis offer is valid from {{start_date}} to {{end_date}}. To redeem, simply mention this email or use code {{promo_code}} during your next visit.\n\nWe look forward to seeing you soon!\n\nBest regards,\n{{user_name}}\n{{business_name}}",
          variables: [
            "customer_name",
            "business_name",
            "promotion_details",
            "start_date",
            "end_date",
            "promo_code",
            "user_name",
          ],
          category: "marketing",
        },
      ];

      return {
        templates,
        total: templates.length,
      };
    },
  });

  // Fetch recent customers
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useQuery({
    queryKey: ["/api/communications/customers"],
    queryFn: async () => {
      // Mock customers data
      const customers: Customer[] = [
        {
          id: 101,
          name: "John Smith",
          email: "john.smith@example.com",
          avatarUrl: "https://i.pravatar.cc/150?img=1",
          lastContact: "2025-05-10T14:30:00",
        },
        {
          id: 102,
          name: "Sarah Johnson",
          email: "sarah.j@example.com",
          avatarUrl: "https://i.pravatar.cc/150?img=2",
          lastContact: "2025-05-09T10:15:00",
        },
        {
          id: 103,
          name: "David Chen",
          email: "d.chen@example.com",
          avatarUrl: "https://i.pravatar.cc/150?img=3",
          lastContact: "2025-05-08T16:45:00",
        },
        {
          id: 104,
          name: "Emma Wilson",
          email: "emma.w@example.com",
          avatarUrl: "https://i.pravatar.cc/150?img=4",
          lastContact: "2025-05-07T09:20:00",
        },
        {
          id: 105,
          name: "Michael Brown",
          email: "michael.b@example.com",
          avatarUrl: "https://i.pravatar.cc/150?img=5",
          lastContact: "2025-05-06T11:10:00",
        },
      ];

      return {
        customers,
        total: customers.length,
      };
    },
  });

  // Form for new message
  const form = useForm<z.infer<typeof newMessageSchema>>({
    resolver: zodResolver(newMessageSchema),
    defaultValues: {
      to: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof newMessageSchema>) => {
    console.log("Sending message:", values);
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    });
    
    setIsComposeOpen(false);
    form.reset();
    
    // Refresh the messages
    queryClient.invalidateQueries({ queryKey: ["/api/communications/messages"] });
  };

  const handleMarkAsRead = (messageId: number) => {
    // Mark message as read
    setSelectedMessage(messageId);
    
    // Refresh the messages
    queryClient.invalidateQueries({ queryKey: ["/api/communications/messages"] });
  };

  const getMessage = (messageId: number | null) => {
    if (!messageId || !messagesData) return null;
    return messagesData.messages.find((msg) => msg.id === messageId);
  };

  const selectedMessageData = getMessage(selectedMessage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };
  
  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>Communications | Reputation Sentinel</title>
        <meta
          name="description"
          content="Manage all your customer communications in one place."
        />
      </Helmet>

      <div className="min-h-screen">
        <main className="flex-1 p-2 md:p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6 px-2">
              <p className="text-slate-500">
                Manage all your customer communications in one place
              </p>
            </header>

            <Tabs
              defaultValue="messages"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="messages">
                  <Mail className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <File className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="customers">
                  <Users className="h-4 w-4 mr-2" />
                  Customers
                </TabsTrigger>
              </TabsList>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 mb-4 px-2">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search messages..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setIsComposeOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Compose
                  </Button>
                </div>

                <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                  {/* Sidebar with folders */}
                  <div className="w-full lg:w-64 shrink-0">
                    <Card>
                      <CardContent className="p-0">
                        <div className="py-2">
                          <div
                            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md ${
                              selectedFolder === "inbox"
                                ? "bg-slate-100 font-medium text-slate-900"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                            onClick={() => setSelectedFolder("inbox")}
                          >
                            <Inbox className="h-4 w-4" />
                            <span>Inbox</span>
                            {messagesData?.unread ? (
                              <Badge className="ml-auto">{messagesData.unread}</Badge>
                            ) : null}
                          </div>
                          <div
                            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md ${
                              selectedFolder === "sent"
                                ? "bg-slate-100 font-medium text-slate-900"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                            onClick={() => setSelectedFolder("sent")}
                          >
                            <Send className="h-4 w-4" />
                            <span>Sent</span>
                          </div>
                          <div
                            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md ${
                              selectedFolder === "drafts"
                                ? "bg-slate-100 font-medium text-slate-900"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                            onClick={() => setSelectedFolder("drafts")}
                          >
                            <File className="h-4 w-4" />
                            <span>Drafts</span>
                          </div>
                          <div
                            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md ${
                              selectedFolder === "trash"
                                ? "bg-slate-100 font-medium text-slate-900"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                            onClick={() => setSelectedFolder("trash")}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Trash</span>
                          </div>
                        </div>
                        <Separator />
                        <div className="py-2">
                          <h3 className="px-3 py-1 text-xs font-medium text-slate-500">LABELS</h3>
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer rounded-md">
                            <span className="h-2 w-2 bg-red-400 rounded-full"></span>
                            <span>Important</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer rounded-md">
                            <span className="h-2 w-2 bg-green-400 rounded-full"></span>
                            <span>Positive</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer rounded-md">
                            <span className="h-2 w-2 bg-yellow-400 rounded-full"></span>
                            <span>Review</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer rounded-md">
                            <span className="h-2 w-2 bg-blue-400 rounded-full"></span>
                            <span>Follow Up</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Message list and detail view */}
                  <div className="flex-1">
                    <Card className="h-[calc(100vh-250px)] min-h-[500px] flex flex-col lg:flex-row overflow-hidden">
                      {/* Message list */}
                      <div className={`w-full ${selectedMessage ? 'hidden lg:block lg:w-1/3 border-r' : 'lg:w-full'}`}>
                        <div className="h-full flex flex-col">
                          <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                            <h3 className="font-medium text-slate-800 capitalize">
                              {selectedFolder}
                            </h3>
                            <Button variant="ghost" size="icon">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                          {isLoadingMessages ? (
                            <div className="flex justify-center items-center p-8 h-full">
                              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                            </div>
                          ) : messagesError ? (
                            <div className="text-center text-red-500 p-4">
                              Failed to load messages
                            </div>
                          ) : messagesData?.messages.length === 0 ? (
                            <div className="text-center text-slate-500 p-8 h-full flex flex-col items-center justify-center">
                              <Inbox className="h-12 w-12 text-slate-300 mb-2" />
                              <p>No messages in {selectedFolder}</p>
                            </div>
                          ) : (
                            <ScrollArea className="h-[calc(100vh-300px)] min-h-[450px]">
                              {messagesData?.messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`p-3 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                                    !message.isRead ? "bg-blue-50/30" : ""
                                  } ${
                                    selectedMessage === message.id ? "bg-blue-50" : ""
                                  }`}
                                  onClick={() => handleMarkAsRead(message.id)}
                                >
                                  <div className="flex items-start gap-2">
                                    <Avatar className="h-8 w-8">
                                      {message.customerAvatarUrl ? (
                                        <AvatarImage
                                          src={message.customerAvatarUrl}
                                          alt={message.customerName}
                                        />
                                      ) : null}
                                      <AvatarFallback>
                                        {getInitials(message.customerName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between mb-1">
                                        <p
                                          className={`text-sm truncate ${
                                            !message.isRead ? "font-medium" : ""
                                          }`}
                                        >
                                          {selectedFolder === "sent"
                                            ? "To: " + message.customerName
                                            : message.customerName}
                                        </p>
                                        <p className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                          {format(new Date(message.date), "MMM d")}
                                        </p>
                                      </div>
                                      <p className="text-sm font-medium truncate text-slate-800">
                                        {message.subject}
                                      </p>
                                      <p className="text-xs text-slate-500 truncate">
                                        {message.content.substring(0, 80)}...
                                      </p>
                                      {message.labels.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {message.labels.map((label) => (
                                            <Badge
                                              key={label}
                                              variant="outline"
                                              className="text-xs py-0 h-5"
                                            >
                                              {label}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    {message.attachments.length > 0 && (
                                      <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                          )}
                        </div>
                      </div>

                      {/* Message detail view */}
                      {selectedMessage && selectedMessageData ? (
                        <div className={`w-full h-full lg:w-2/3 flex flex-col ${selectedMessage ? 'block' : 'hidden lg:block'}`}>
                          <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="lg:hidden"
                              onClick={() => setSelectedMessage(null)}
                            >
                              ← Back
                            </Button>
                            <div className="flex items-center gap-2 ml-auto">
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                  <Avatar className="h-10 w-10">
                                    {selectedMessageData.customerAvatarUrl ? (
                                      <AvatarImage
                                        src={selectedMessageData.customerAvatarUrl}
                                        alt={selectedMessageData.customerName}
                                      />
                                    ) : null}
                                    <AvatarFallback>
                                      {getInitials(selectedMessageData.customerName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h2 className="text-base font-medium">
                                      {selectedMessageData.customerName}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                      {selectedMessageData.customerEmail}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-500">
                                  {formatDate(selectedMessageData.date)}
                                </p>
                              </div>
                              <h3 className="text-lg font-medium">
                                {selectedMessageData.subject}
                              </h3>
                              <div className="text-slate-700 space-y-2">
                                {selectedMessageData.content.split("\n\n").map((paragraph, i) => (
                                  <p key={i}>
                                    {paragraph.split("\n").map((line, j) => (
                                      <React.Fragment key={j}>
                                        {line}
                                        <br />
                                      </React.Fragment>
                                    ))}
                                  </p>
                                ))}
                              </div>
                              {selectedMessageData.attachments.length > 0 && (
                                <div className="pt-4 border-t">
                                  <h4 className="text-sm font-medium mb-2">Attachments:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedMessageData.attachments.map((attachment, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-md"
                                      >
                                        <Paperclip className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm">{attachment}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                          <div className="p-4 border-t">
                            <Textarea
                              placeholder="Type your reply here..."
                              className="mb-3"
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">
                                <File className="h-4 w-4 mr-2" />
                                Save Draft
                              </Button>
                              <Button>
                                <Send className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : !isLoadingMessages && !messagesError && messagesData?.messages && messagesData.messages.length > 0 ? (
                        <div className="hidden lg:flex flex-1 items-center justify-center text-center p-8">
                          <div>
                            <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-800 mb-1">
                              Select a message
                            </h3>
                            <p className="text-slate-500">
                              Choose a message from the list to view its contents
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Message Templates</span>
                      <Button size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Template
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Create and manage templates for common communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTemplates ? (
                      <div className="flex justify-center p-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : templatesError ? (
                      <div className="text-center text-red-500 p-4">
                        Failed to load templates
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templatesData?.templates.map((template) => (
                          <Card key={template.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <CardDescription>
                                Category: {template.category.replace("_", " ")}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm font-medium">Subject: {template.subject}</p>
                              <p className="text-xs text-slate-500 mt-2">
                                Variables: {template.variables.join(", ")}
                              </p>
                            </CardContent>
                            <CardFooter className="pt-2 flex justify-between">
                              <Button variant="ghost" size="sm">
                                Preview
                              </Button>
                              <Button variant="outline" size="sm">
                                Use Template
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Customers Tab */}
              <TabsContent value="customers">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Communication History</CardTitle>
                    <CardDescription>
                      View and manage your recent customer communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCustomers ? (
                      <div className="flex justify-center p-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : customersError ? (
                      <div className="text-center text-red-500 p-4">
                        Failed to load customers
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead className="hidden md:table-cell">Email</TableHead>
                              <TableHead className="hidden md:table-cell">Last Contact</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customersData?.customers.map((customer) => (
                              <TableRow key={customer.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      {customer.avatarUrl ? (
                                        <AvatarImage
                                          src={customer.avatarUrl}
                                          alt={customer.name}
                                        />
                                      ) : null}
                                      <AvatarFallback>
                                        {getInitials(customer.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{customer.name}</div>
                                      <div className="text-sm text-slate-500 md:hidden">
                                        {customer.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {customer.email}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {customer.lastContact
                                    ? format(new Date(customer.lastContact), "MMM d, yyyy")
                                    : "Never"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        form.setValue("to", customer.email);
                                        setIsComposeOpen(true);
                                      }}
                                    >
                                      <Mail className="h-4 w-4" />
                                      <span className="sr-only">Email</span>
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <Phone className="h-4 w-4" />
                                      <span className="sr-only">Call</span>
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <User className="h-4 w-4" />
                                      <span className="sr-only">Profile</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
            <DialogDescription>
              Create and send a new message to a customer
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input placeholder="recipient@example.com" {...field} />
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
                      <Input placeholder="Message subject" {...field} />
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
                        placeholder="Type your message here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="save-sent" />
                    <label
                      htmlFor="save-sent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Save to sent folder
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="track-opens" />
                    <label
                      htmlFor="track-opens"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Track opens
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="high-priority" />
                    <label
                      htmlFor="high-priority"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      High priority
                    </label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsComposeOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Send Message</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommunicationsPage;