import React, { useState } from 'react';
import { User, LogOut, Settings, Trophy, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { logger, LogCategory } from '../../utils/logger';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { user, profile, signOut, loading } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      logger.info(LogCategory.AUTH, 'User signing out');
      await signOut();
      setIsOpen(false);
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Sign out failed', error);
    }
  };

  const displayName = profile?.username || user.email?.split('@')[0] || 'Usuario';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className={`relative ${className}`}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        disabled={loading}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        {/* Name */}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
          {displayName}
        </span>

        {/* Chevron */}
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Implementar navegación a perfil
                  logger.info(LogCategory.USER, 'Navigate to profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('userMenu.settings')}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Implementar navegación a estadísticas
                  logger.info(LogCategory.USER, 'Navigate to stats');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                {t('userMenu.myStats')}
              </button>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loading ? t('auth.signingOut') : t('auth.logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}