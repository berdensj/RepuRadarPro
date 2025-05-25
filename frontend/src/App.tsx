import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { StatCard } from "./components/dashboard/StatCard";
import { ReviewActivityCard } from "./components/dashboard/ReviewActivityCard";
import { WeeklyChartDemo } from "./components/dashboard/WeeklyChartDemo";
import { TrialBanner } from "./components/ui/TrialBanner";
import { Star, TrendingUp, MessageSquare, AlertTriangle, Settings, BarChart3, Users } from "lucide-react";

function App() {
  // Mock data to showcase your enhanced components
  const mockStats = {
    totalReviews: 1234,
    averageRating: 4.8,
    responseRate: 94,
    activeAlerts: 3
  };

  const mockActivities = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      rating: 5,
      comment: "Excellent service! Very professional staff and amazing results.",
      platform: "Google",
      timeAgo: "2 hours ago",
      sentiment: "positive" as const
    },
    {
      id: 2,
      customerName: "Mike Chen", 
      rating: 4,
      comment: "Good experience overall. Will definitely recommend to others.",
      platform: "Yelp",
      timeAgo: "5 hours ago",
      sentiment: "positive" as const
    },
    {
      id: 3,
      customerName: "Emily Rodriguez",
      rating: 5,
      comment: "Amazing experience from start to finish. Highly recommend!",
      platform: "Facebook",
      timeAgo: "1 day ago",
      sentiment: "positive" as const
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Trial Banner */}
      <TrialBanner daysLeft={12} />
      
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">RS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reputation Sentinel</h1>
                <p className="text-sm text-gray-500">Professional Reputation Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Trial Active
              </Badge>
              <Button size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section with Enhanced Styling */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600 text-lg">Here's your comprehensive reputation management overview.</p>
        </div>

        {/* Enhanced Stats Grid using your StatCard component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Reviews"
            value={mockStats.totalReviews.toLocaleString()}
            icon={<MessageSquare className="h-5 w-5" />}
            trend={12}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
          <StatCard
            title="Average Rating"
            value={mockStats.averageRating.toString()}
            icon={<Star className="h-5 w-5" />}
            trend={4}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
          />
          <StatCard
            title="Response Rate"
            value={`${mockStats.responseRate}%`}
            icon={<BarChart3 className="h-5 w-5" />}
            trend={8}
            className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          />
          <StatCard
            title="Active Alerts"
            value={mockStats.activeAlerts.toString()}
            icon={<AlertTriangle className="h-5 w-5" />}
            trend={-2}
            className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
          />
        </div>

        {/* Enhanced Layout with your custom components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Enhanced Quick Actions */}
          <Card className="lg:col-span-1 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common reputation management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                View All Reviews
              </Button>
              <Button variant="outline" className="w-full justify-start border-orange-200 hover:bg-orange-50">
                <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                Check Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start border-green-200 hover:bg-green-50">
                <BarChart3 className="w-4 h-4 mr-2 text-green-600" />
                Analytics Dashboard
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2 text-gray-600" />
                Platform Settings
              </Button>
            </CardContent>
          </Card>

          {/* Enhanced Review Activity using your component */}
          <div className="lg:col-span-2">
            <ReviewActivityCard 
              activities={mockActivities}
              className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50"
            />
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <WeeklyChartDemo />
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                Platform Performance
              </CardTitle>
              <CardDescription>Review distribution across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Google</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">75%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Yelp</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">60%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Facebook</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Feature Highlights */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-xl">Platform Capabilities</CardTitle>
            <CardDescription>Comprehensive reputation management ecosystem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Review Management</h3>
                <p className="text-sm text-gray-600">Advanced sentiment analysis and automated response suggestions across all major platforms</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics Dashboard</h3>
                <p className="text-sm text-gray-600">Real-time insights, trend analysis, and comprehensive performance metrics</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Intelligent Alert System</h3>
                <p className="text-sm text-gray-600">Instant notifications and proactive monitoring for critical reputation events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;