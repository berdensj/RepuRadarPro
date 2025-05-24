import React, { useState } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "../../hooks/use-auth";
import logo from '../../assets/logo.png';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [notificationCount] = useState(0);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className={`w-full bg-white border-b border-slate-200 py-2 px-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <a href="/dashboard" className="flex items-center">
          <img src={logo} alt="Reputation Sentinel Logo" className="h-8 w-auto" />
        </a>

        <div className="flex items-center">
          {/* Notification Bell */}
          <Button variant="ghost" size="sm" className="mr-2 relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                {notificationCount}
              </span>
            )}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-8 w-8">
                  {user?.profilePicture ? (
                    <AvatarImage src={user.profilePicture} alt={user?.fullName || ""} />
                  ) : (
                    <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <span className="hidden md:inline-block">{user?.fullName || user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/profile" className="cursor-pointer flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}