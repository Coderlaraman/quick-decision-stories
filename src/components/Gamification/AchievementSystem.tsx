import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Star, Medal, Award, Lock, CheckCircle, Coins, Zap } from 'lucide-react';
import { Achievement, UserAchievement } from '../../types/community';
import { communityApi } from '../../lib/api/community';
import { useAuth } from '../../contexts/AuthContext';

interface AchievementSystemProps {
  userId?: string;
  showOnlyUnlocked?: boolean;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  userId, 
  showOnlyUnlocked = false 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      loadAchievements();
      loadUserAchievements();
    }
  }, [currentUserId]);

  const loadAchievements = async () => {
    try {
      const response = await communityApi.getAchievements();
      setAchievements(response.data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadUserAchievements = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const response = await communityApi.getUserAchievements(currentUserId);
      setUserAchievements(response.data);
    } catch (error) {
      console.error('Error loading user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type: string, tier: string) => {
    const iconProps = { className: "w-8 h-8" };
    
    switch (type) {
      case 'story_creation':
        return <Award {...iconProps} />;
      case 'story_completion':
        return <CheckCircle {...iconProps} />;
      case 'community_engagement':
        return <Star {...iconProps} />;
      case 'special_event':
        return <Medal {...iconProps} />;
      default:
        return <Trophy {...iconProps} />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'platinum':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'diamond':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getAchievementProgress = (achievementId: string) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievementId);
    return userAchievement?.progress || 0;
  };

  const filteredAchievements = achievements.filter(achievement => {
    const isUnlocked = isAchievementUnlocked(achievement.id);
    
    // Filter by unlock status
    if (filter === 'unlocked' && !isUnlocked) return false;
    if (filter === 'locked' && isUnlocked) return false;
    if (showOnlyUnlocked && !isUnlocked) return false;
    
    // Filter by category
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    
    return true;
  });

  const categories = [...new Set(achievements.map(a => a.category))];
  const totalAchievements = achievements.length;
  const unlockedCount = userAchievements.length;
  const totalPoints = userAchievements.reduce((sum, ua) => {
    const achievement = achievements.find(a => a.id === ua.achievement_id);
    return sum + (achievement?.points || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('gamification.achievements')}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 mr-3" />
              <div>
                <p className="text-blue-100 text-sm">{t('gamification.achievementsUnlocked')}</p>
                <p className="text-2xl font-bold">{unlockedCount}/{totalAchievements}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <Star className="w-8 h-8 mr-3" />
              <div>
                <p className="text-yellow-100 text-sm">{t('gamification.totalPoints')}</p>
                <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <Zap className="w-8 h-8 mr-3" />
              <div>
                <p className="text-green-100 text-sm">{t('gamification.completionRate')}</p>
                <p className="text-2xl font-bold">{((unlockedCount / totalAchievements) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex space-x-2">
          {(['all', 'unlocked', 'locked'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`gamification.filter.${filterType}`)}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            {t('gamification.category')}:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('gamification.allCategories')}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {t(`gamification.categories.${category}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = isAchievementUnlocked(achievement.id);
          const progress = getAchievementProgress(achievement.id);
          const progressPercentage = achievement.target_value > 0 
            ? Math.min((progress / achievement.target_value) * 100, 100)
            : 0;

          return (
            <div
              key={achievement.id}
              className={`bg-white rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
                isUnlocked 
                  ? getTierColor(achievement.tier)
                  : 'border-gray-200 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  isUnlocked 
                    ? getTierColor(achievement.tier).replace('border-', 'bg-').replace('text-', 'text-')
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isUnlocked ? (
                    getAchievementIcon(achievement.type, achievement.tier)
                  ) : (
                    <Lock className="w-8 h-8" />
                  )}
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {achievement.points}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getTierColor(achievement.tier)
                  }`}>
                    {t(`gamification.tiers.${achievement.tier}`)}
                  </span>
                </div>
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 ${
                isUnlocked ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h3>
              
              <p className={`text-sm mb-4 ${
                isUnlocked ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>
              
              {/* Progress Bar */}
              {achievement.target_value > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{t('gamification.progress')}</span>
                    <span>{progress}/{achievement.target_value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isUnlocked ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Unlock Date */}
              {isUnlocked && (
                <div className="flex items-center text-xs text-gray-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>
                    {t('gamification.unlockedOn')}: {' '}
                    {new Date(userAchievements.find(ua => ua.achievement_id === achievement.id)?.unlocked_at || '').toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('gamification.noAchievements')}
          </h3>
          <p className="text-gray-600">
            {t('gamification.noAchievementsDescription')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementSystem;