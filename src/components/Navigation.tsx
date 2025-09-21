import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  BookOpen, 
  Crown, 
  Trophy, 
  PenTool, 
  Shield, 
  CreditCard, 
  Star,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      path: '/',
      label: t('navigation.home'),
      icon: Home,
      requiresAuth: false
    },
    {
      path: '/marketplace',
      label: t('marketplace.title'),
      icon: Crown,
      requiresAuth: false
    },
    {
      path: '/gamification',
      label: t('gamification.title'),
      icon: Trophy,
      requiresAuth: true
    },
    {
      path: '/create',
      label: t('editor.title'),
      icon: PenTool,
      requiresAuth: true
    },
    {
      path: '/reputation',
      label: t('reputation.title'),
      icon: Star,
      requiresAuth: true
    },
    {
      path: '/subscription',
      label: t('subscription.title'),
      icon: Users,
      requiresAuth: true
    }
  ];

  // Add moderation link for moderators/admins
  if (user?.role === 'moderator' || user?.role === 'admin') {
    navigationItems.push({
      path: '/moderation',
      label: t('moderation.title'),
      icon: Shield,
      requiresAuth: true
    });
  }

  // Add payment link for premium users or authors
  if (user?.role === 'author' || user?.subscription_status === 'active') {
    navigationItems.push({
      path: '/payment',
      label: t('payment.title'),
      icon: CreditCard,
      requiresAuth: true
    });
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-8 py-4">
          {navigationItems.map((item) => {
            // Hide auth-required items if user is not logged in
            if (item.requiresAuth && !user) {
              return null;
            }

            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}