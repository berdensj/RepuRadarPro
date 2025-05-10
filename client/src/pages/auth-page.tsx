import { useEffect, useState } from "react";
import { useAuth, LoginData, RegisterData } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      fullName: "",
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate({
      ...data,
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
                RepuRadar
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
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </Form>
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
            RepuRadar helps professionals monitor, analyze, and respond to online reviews across multiple platforms.
          </p>
          
          <div className="space-y-4 w-full">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-white shadow-sm">
              <div className="bg-blue-100 p-2 rounded-full text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">For Professionals</h3>
                <p className="text-sm text-slate-600">
                  Doctors, lawyers, accountants, and more use RepuRadar to protect and enhance their online reputation.
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
