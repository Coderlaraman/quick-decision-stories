import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Coins, Star, Gift, TrendingUp, Users, Target } from 'lucide-react';
import { UserStats } from '../types/community';
import { communityApi } from '../lib/api/community';
import { useAuth } from '../contexts/AuthContext';
import AchievementSystem from '../components/Gamification/AchievementSystem';
import VirtualEconomy from '../components/Gamification/VirtualEconomy';
import RewardSystem from '../components/Gamification/RewardSystem';

const Gamification: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'economy' | 'rewards'>('overview');
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
      if (activeTab === 'overview') {
        loadLeaderboard();
      }
    }
  }, [user?.id, activeTab]);

  const loadUserStats = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await communityApi.getUserStats(user.id);
      setUserStats(response);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const response = await communityApi.getLeaderboard({
        type: 'points',
        limit: 10
      });
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const getUserRank = () => {
    if (!user?.id || !userStats) return null;
    const rank = leaderboard.findIndex(u => u.user_id === user.id) + 1;
    return rank > 0 ? rank : null;
  };

  const getProgressToNextLevel = () => {
    if (!userStats) return 0;
    const currentLevel = userStats.level || 1;
    const currentExp = userStats.experience || 0;
    const expForNextLevel = currentLevel * 100;
    return Math.min((currentExp / expForNextLevel) * 100, 100);
  };

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

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('gamification.loginRequired')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('gamification.loginRequiredDescription')}
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {t('auth.signIn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {t('gamification.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('gamification.subtitle')}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b">
          {(['overview', 'achievements', 'economy', 'rewards'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {tab === 'overview' && <TrendingUp className="w-4 h-4" />}
                {tab === 'achievements' && <Trophy className="w-4 h-4" />}
                {tab === 'economy' && <Coins className="w-4 h-4" />}
                {tab === 'rewards' && <Gift className="w-4 h-4" />}
                <span>{t(`gamification.tabs.${tab}`)}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* User Stats Overview */}
          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      {t('gamification.level')}
                    </p>
                    <p className="text-3xl font-bold">
                      {userStats.level || 1}
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full transition-all"
                          style={{ width: `${getProgressToNextLevel()}%` }}
                        ></div>
                      </div>
                      <p className="text-blue-100 text-xs mt-1">
                        {userStats.experience || 0}/{(userStats.level || 1) * 100} XP
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                    <Star className="w-8 h-8" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">
                      {t('gamification.coins')}
                    </p>
                    <p className="text-3xl font-bold">
                      {userStats.coins.toLocaleString()}
                    </p>
                    <p className="text-yellow-100 text-xs mt-1">
                      {t('gamification.spendableBalance')}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-400 bg-opacity-30 rounded-lg">
                    <Coins className="w-8 h-8" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      {t('gamification.points')}
                    </p>
                    <p className="text-3xl font-bold">
                      {userStats.points.toLocaleString()}
                    </p>
                    <p className="text-purple-100 text-xs mt-1">
                      {t('gamification.reputationScore')}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
                    <Trophy className="w-8 h-8" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      {t('gamification.rank')}
                    </p>
                    <p className="text-3xl font-bold">
                      #{getUserRank() || '---'}
                    </p>
                    <p className="text-green-100 text-xs mt-1">
                      {t('gamification.globalRanking')}
                    </p>
                  </div>
                  <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
                    <Target className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('gamification.quickActions')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('achievements')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                <h4 className="font-medium text-gray-900">
                  {t('gamification.viewAchievements')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('gamification.viewAchievementsDescription')}
                </p>
              </button>
              
              <button
                onClick={() => setActiveTab('economy')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <Coins className="w-8 h-8 text-yellow-500 mb-2" />
                <h4 className="font-medium text-gray-900">
                  {t('gamification.manageCoins')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('gamification.manageCoinsDescription')}
                </p>
              </button>
              
              <button
                onClick={() => setActiveTab('rewards')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <Gift className="w-8 h-8 text-red-500 mb-2" />
                <h4 className="font-medium text-gray-900">
                  {t('gamification.claimRewards')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('gamification.claimRewardsDescription')}
                </p>
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('gamification.leaderboard')}
                </h3>
              </div>
            </div>
            
            <div className="divide-y">
              {leaderboardLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">{t('common.loading')}</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('gamification.noLeaderboardData')}</p>
                </div>
              ) : (
                leaderboard.map((userStat, index) => (
                  <div key={userStat.user_id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {userStat.username || t('gamification.anonymousUser')}
                            {userStat.user_id === user?.id && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {t('gamification.you')}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t('gamification.level')} {userStat.level || 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {userStat.points.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('gamification.points')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <AchievementSystem userId={user?.id} />
      )}

      {activeTab === 'economy' && (
        <VirtualEconomy userId={user?.id} showTransactions={true} />
      )}

      {activeTab === 'rewards' && (
        <RewardSystem userId={user?.id} />
      )}
    </div>
  );
};

export default Gamification;