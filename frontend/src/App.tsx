import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Star, TrendingUp, MessageSquare, AlertTriangle, Settings, BarChart3, Users, Clock, Shield, Menu, LayoutDashboard, Sparkles, Send, HelpCircle, User, Puzzle } from "lucide-react";
import { useState } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/", active: true },
    { icon: Star, label: "Reviews", href: "/reviews" },
    { icon: Sparkles, label: "AI Responses", href: "/responses" },
    { icon: Send, label: "Review Requests", href: "/requests" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: AlertTriangle, label: "Alerts", href: "/alerts" },
    { icon: Users, label: "Competitors", href: "/competitors" },
    { icon: Puzzle, label: "Integrations", href: "/integrations" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: HelpCircle, label: "Help", href: "/help" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        {/* Trial Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">12 days left</span>
            </div>
            <Button size="sm" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 text-xs px-2 py-1">
              Upgrade
            </Button>
          </div>
        </div>

        {/* Logo and Brand */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reputation Sentinel</h1>
              <p className="text-xs text-gray-500">Professional Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  item.active 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">JD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Free Trial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b shadow-sm p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Active
            </Badge>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome back!</h2>
            <p className="text-xl text-gray-600">Comprehensive reputation management at your fingertips.</p>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Reviews</CardTitle>
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">1,234</div>
                <p className="text-sm text-blue-700 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-800">Average Rating</CardTitle>
                <Star className="h-6 w-6 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-900">4.8</div>
                <p className="text-sm text-yellow-700">+0.2 this month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Response Rate</CardTitle>
                <BarChart3 className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">94%</div>
                <p className="text-sm text-green-700">+8% this month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Active Alerts</CardTitle>
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900">3</div>
                <p className="text-sm text-red-700">2 new this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Quick Actions */}
            <Card className="lg:col-span-1 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Users className="w-6 h-6 mr-3 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-base">Essential reputation management tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start h-12 bg-blue-600 hover:bg-blue-700 text-lg">
                  <MessageSquare className="w-5 h-5 mr-3" />
                  View All Reviews
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 border-orange-200 hover:bg-orange-50 text-lg">
                  <AlertTriangle className="w-5 h-5 mr-3 text-orange-600" />
                  Check Alerts
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 border-green-200 hover:bg-green-50 text-lg">
                  <BarChart3 className="w-5 h-5 mr-3 text-green-600" />
                  Analytics Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 text-lg">
                  <Settings className="w-5 h-5 mr-3 text-gray-600" />
                  Platform Settings
                </Button>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="lg:col-span-2 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3 text-green-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-base">Latest customer reviews and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Sarah Johnson</p>
                      <p className="text-gray-700 mt-1">"Excellent service! Very professional staff and amazing results."</p>
                      <p className="text-sm text-gray-500 mt-2">Google • 2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex space-x-1">
                      {[1,2,3,4].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Mike Chen</p>
                      <p className="text-gray-700 mt-1">"Good experience overall. Will definitely recommend to others."</p>
                      <p className="text-sm text-gray-500 mt-2">Yelp • 5 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Emily Rodriguez</p>
                      <p className="text-gray-700 mt-1">"Amazing experience from start to finish. Highly recommend!"</p>
                      <p className="text-sm text-gray-500 mt-2">Facebook • 1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Features */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold">Platform Capabilities</CardTitle>
              <CardDescription className="text-lg">Comprehensive reputation management ecosystem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Review Management</h3>
                  <p className="text-gray-600 leading-relaxed">Advanced sentiment analysis and automated response suggestions across all major platforms</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Analytics Dashboard</h3>
                  <p className="text-gray-600 leading-relaxed">Real-time insights, trend analysis, and comprehensive performance metrics</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Intelligent Alert System</h3>
                  <p className="text-gray-600 leading-relaxed">Instant notifications and proactive monitoring for critical reputation events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;