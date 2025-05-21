import { useEffect, useState } from "react";
import { useAuth, LoginData, RegisterData } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { ChartLine, User } from "lucide-react";
import { useLocation } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [, navigate] = useLocation();
  
  // Login form direct state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form direct state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Redirect admin users to the admin dashboard, regular users to the main dashboard
      if (user.role === 'admin' && user.username === 'admin') {
        console.log("Redirecting system admin to admin dashboard");
        navigate("/admin");
      } else {
        console.log("Redirecting to main dashboard");
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  // We're using direct state management instead of react-hook-form now

  const onLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Login attempt with:", loginEmail);
    
    // We need to handle the case when a user enters a username instead of email
    loginMutation.mutate({
      email: loginEmail,
      password: loginPassword
    }, {
      onSuccess: (user) => {
        // Console log for debugging
        console.log("Login successful, user data:", user);
        console.log("User role:", user.role);
        
        // For system admin only (username 'admin'), go to admin dashboard
        // For all other users including client admins, go to regular dashboard
        if (user.role === 'admin' && user.username === 'admin') {
          console.log("Redirecting system admin to admin dashboard");
          navigate('/admin');
        } else {
          console.log("Redirecting to regular dashboard");
          navigate('/dashboard');
        }
      }
    });
  };

  const onRegisterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    registerMutation.mutate({
      email: registerEmail,
      username: registerUsername,
      password: registerPassword,
      fullName: registerFullName,
      plan: "Free"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 items-center">
        {/* Authentication Form */}
        <Card className="w-full p-6 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-6">
              <div className="text-primary text-3xl font-bold flex items-center">
                <ChartLine className="h-6 w-6 mr-2" />
                Reputation Sentinel
              </div>
            </div>
            
            <div className="flex space-x-2 mb-6">
              <Button 
                variant={isLogin ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </Button>
              <Button 
                variant={!isLogin ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setIsLogin(false)}
              >
                Register
              </Button>
            </div>

            {isLogin ? (
              <div>
                <form onSubmit={onLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email or Username</Label>
                    <Input 
                      id="email" 
                      type="text" 
                      placeholder="you@example.com or username" 
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Quick login: <Button type="button" variant="link" className="p-0 h-auto text-primary" onClick={() => setLoginEmail("admin")}>admin</Button> or <Button type="button" variant="link" className="p-0 h-auto text-primary" onClick={() => setLoginEmail("client")}>client</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Password: <Button type="button" variant="link" className="p-0 h-auto text-primary" onClick={() => setLoginPassword(loginEmail === "admin" ? "admin123" : "client123")}>fill default password</Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </div>
            ) : (
              <div>
                <form onSubmit={onRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      type="text" 
                      placeholder="John Doe" 
                      value={registerFullName} 
                      onChange={(e) => setRegisterFullName(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input 
                      id="registerEmail" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={registerEmail} 
                      onChange={(e) => setRegisterEmail(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="johndoe" 
                      value={registerUsername} 
                      onChange={(e) => setRegisterUsername(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input 
                      id="registerPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      value={registerPassword} 
                      onChange={(e) => setRegisterPassword(e.target.value)} 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </div>
            )}
            
            {isLogin && (
              <div className="mt-4 text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <button 
                  onClick={() => setIsLogin(false)} 
                  className="text-primary hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </div>
            )}
            
            {!isLogin && (
              <div className="mt-4 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <button 
                  onClick={() => setIsLogin(true)} 
                  className="text-primary hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Hero Section */}
        <div className="hidden md:flex flex-col items-start">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Manage Your Professional Reputation with Ease</h1>
          <p className="text-lg text-slate-600 mb-6">
            Reputation Sentinel helps professionals monitor, analyze, and respond to online reviews across multiple platforms.
          </p>
          
          <div className="space-y-4 w-full">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-white shadow-sm">
              <div className="bg-blue-100 p-2 rounded-full text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">For Professionals</h3>
                <p className="text-sm text-slate-600">
                  Doctors, lawyers, accountants, and more use Reputation Sentinel to protect and enhance their online reputation.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-white shadow-sm">
              <div className="bg-green-100 p-2 rounded-full text-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-medium">AI-Powered Responses</h3>
                <p className="text-sm text-slate-600">
                  Generate professional responses to reviews automatically with our AI technology.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-white shadow-sm">
              <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
              </div>
              <div>
                <h3 className="font-medium">Comprehensive Analytics</h3>
                <p className="text-sm text-slate-600">
                  Track trends, identify issues, and monitor your reputation growth over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
