import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Building,
  ChevronLeft,
  UserCog,
  Settings,
  PieChart,
  MessageSquare,
  Briefcase,
  User,
  LogOut,
  Blocks,
  Star,
  Bell,
  BarChart,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const clientAdminItems: SidebarItem[] = [
  {
    title: "Users Management",
    href: "/client-admin/users",
    icon: <UserCog className="h-5 w-5" />,
  },
  {
    title: "Locations",
    href: "/client-admin/locations",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "Integrations",
    href: "/client-admin/integrations",
    icon: <Blocks className="h-5 w-5" />,
  },
  {
    title: "Reviews",
    href: "/client-admin/reviews",
    icon: <Star className="h-5 w-5" />,
  },
  {
    title: "Reports",
    href: "/client-admin/reports",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/client-admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function ClientAdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Determine if mobile view based on screen width
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // For mobile, start with sidebar closed
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Nav content that appears in both desktop sidebar and mobile drawer
  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center px-4 py-2 border-b">
        <Button 
          variant="link" 
          className="p-0 h-auto" 
          onClick={() => window.location.href = "/reviews"}
        >
          <div className="flex items-center gap-2 font-bold text-xl cursor-pointer">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span>RepuRadar</span>
            <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded">Client Admin</span>
          </div>
        </Button>
      </div>
      <div className="flex-1">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="px-2 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Administration
            </h2>
            <div className="space-y-1">
              {clientAdminItems.map((item, index) => (
                <Link key={index} href={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      location === item.href ? "font-medium bg-secondary" : ""
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => window.location.href = "/reviews"}
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{user?.fullName || "User"}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => logoutMutation.mutate()} 
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } hidden md:block transition-all duration-200 ease-in-out overflow-hidden border-r`}
      >
        {renderNavContent()}
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute top-3 left-3 z-10">
            <Blocks className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 pt-0">
          {renderNavContent()}
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}