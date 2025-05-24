import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import logo from '../assets/logo.png';
import { cn } from '../lib/utils';

import {
  LayoutDashboard,
  Star,
  Sparkles,
  Send,
  BarChart2,
  Settings,
  Users,
  Puzzle,
  HelpCircle,
  User,
  LucideIcon,
} from 'lucide-react';

interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const mainNavLinks: NavLinkItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/reviews', label: 'Reviews', icon: Star },
  { href: '/responses', label: 'AI Responses', icon: Sparkles },
  { href: '/review-requests', label: 'Invites & Requests', icon: Send },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/team', label: 'Team Access', icon: Users, adminOnly: true },
  { href: '/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/help', label: 'Help & Docs', icon: HelpCircle },
];

const footerNavLink: NavLinkItem = { href: '/profile', label: 'My Account', icon: User };

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const renderNavLink = (item: NavLinkItem, isFooter = false) => {
    if (item.adminOnly && user?.role !== 'admin') {
      return null;
    }

    const Icon = item.icon;
    const isActive = item.href === '/dashboard' ? location === item.href : location.startsWith(item.href);

    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={cn(
            'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
            'hover:bg-slate-200 dark:hover:bg-slate-700',
            isActive
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/90'
              : 'text-slate-700 dark:text-slate-300',
            isFooter ? 'mt-auto' : ''
          )}
        >
          <Icon className={cn('h-5 w-5 mr-3', isActive ? 'text-primary-foreground' : 'text-slate-500 dark:text-slate-400')} />
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <aside className="w-64 h-screen bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col p-4 fixed left-0 top-0">
      <div className="mb-6 px-2">
        <Link href="/dashboard">
          <img src={logo} alt="Reputation Sentinel Logo" className="h-10 w-auto" />
        </Link>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-1.5">
          {mainNavLinks.map(link => renderNavLink(link))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
        <ul className="space-y-1">
            {renderNavLink(footerNavLink, true)}
        </ul>
      </div>
    </aside>
  );
} 