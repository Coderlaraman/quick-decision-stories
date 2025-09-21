import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Users, Flag, BarChart3, Settings, AlertTriangle } from 'lucide-react';
import ModerationDashboard from '../components/Moderation/ModerationDashboard';
import { useAuth } from '../contexts/AuthContext';
import { communityApi } from '../lib/api/community';

interface ModerationStats {
  pending_stories: number;
  flagged_stories: number;
  total_reports: number;
  active_moderators: number;
  stories_moderated_today: number;
  approval_rate: number;
}

type TabType = 'dashboard' | 'reports' | 'users' | 'stats' | 'settings';

const ModerationAdmin: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | null>(null);

  useEffect(() => {
    checkUserRole();
    loadStats();
  }, [user]);

  const checkUserRole = async () => {
    if (!user) {
      setUserRole(null);
      return;
    }

    try {
      // En una implementación real, verificarías el rol del usuario desde la base de datos
      // Por ahora, asumimos que ciertos usuarios son moderadores/admins
      const profile = await communityApi.getUserProfile(user.id);
      
      // Verificar si el usuario tiene permisos de moderación
      if (profile.role === 'admin' || profile.role === 'moderator') {
        setUserRole(profile.role);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole(null);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await communityApi.getModerationStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading moderation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar permisos
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.loginRequired')}
          </h2>
          <p className="text-gray-600">
            {t('moderation.loginRequiredDescription')}
          </p>
        </div>
      </div>
    );
  }

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('moderation.accessDenied')}
          </h2>
          <p className="text-gray-600">
            {t('moderation.accessDeniedDescription')}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: t('moderation.dashboard'),
      icon: Shield,
      count: stats?.pending_stories
    },
    {
      id: 'reports' as TabType,
      name: t('moderation.reports'),
      icon: Flag,
      count: stats?.total_reports
    },
    {
      id: 'users' as TabType,
      name: t('moderation.users'),
      icon: Users,
      count: stats?.active_moderators
    },
    {
      id: 'stats' as TabType,
      name: t('moderation.statistics'),
      icon: BarChart3
    },
    {
      id: 'settings' as TabType,
      name: t('moderation.settings'),
      icon: Settings
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ModerationDashboard userRole={userRole} />;
      
      case 'reports':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('moderation.reports')}
            </h2>
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('moderation.reportsComingSoon')}</p>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('moderation.userManagement')}
            </h2>
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('moderation.userManagementComingSoon')}</p>
            </div>
          </div>
        );
      
      case 'stats':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('moderation.statistics')}
            </h2>
            
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Shield className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {t('moderation.pendingStories')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.pending_stories}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Flag className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {t('moderation.flaggedStories')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.flagged_stories}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {t('moderation.totalReports')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.total_reports}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {t('moderation.activeModerators')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.active_moderators}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {t('moderation.moderatedToday')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.stories_moderated_today}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {t('moderation.approvalRate')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.approval_rate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'settings':
        return (
          <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('moderation.settings')}
            </h2>
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('moderation.settingsComingSoon')}</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {t('moderation.moderationCenter')}
                </h1>
                <p className="text-sm text-gray-600">
                  {t('moderation.role')}: {t(`moderation.roles.${userRole}`)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ModerationAdmin;