import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Star, Calendar, Trophy, Clock, CheckCircle, Lock, Coins } from 'lucide-react';
import { Reward, UserStats } from '../../types/community';
import { communityApi } from '../../lib/api/community';
import { useAuth } from '../../contexts/AuthContext';

interface RewardSystemProps {
  userId?: string;
}

const RewardSystem: React.FC<RewardSystemProps> = ({ userId }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'achievements' | 'milestones'>('daily');

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      loadRewards();
      loadUserStats();
    }
  }, [currentUserId, activeTab]);

  const loadRewards = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const response = await communityApi.getUserRewards(currentUserId, {
        type: activeTab,
        status: 'all'
      });
      setRewards(response.data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!currentUserId) return;
    
    try {
      const response = await communityApi.getUserStats(currentUserId);
      setUserStats(response);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const claimReward = async (rewardId: string) => {
    if (!currentUserId) return;
    
    try {
      setClaimingReward(rewardId);
      await communityApi.claimReward(currentUserId, rewardId);
      
      // Update rewards list
      setRewards(prev => prev.map(reward => 
        reward.id === rewardId 
          ? { ...reward, status: 'claimed', claimed_at: new Date().toISOString() }
          : reward
      ));
      
      // Reload user stats to reflect new balance
      await loadUserStats();
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaimingReward(null);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="w-6 h-6" />;
      case 'achievement':
        return <Trophy className="w-6 h-6" />;
      case 'milestone':
        return <Star className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'from-green-500 to-green-600';
      case 'achievement':
        return 'from-yellow-500 to-yellow-600';
      case 'milestone':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'claimed':
        return 'text-gray-600 bg-gray-100';
      case 'locked':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Gift className="w-4 h-4" />;
      case 'claimed':
        return <CheckCircle className="w-4 h-4" />;
      case 'locked':
        return <Lock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getDailyRewards = () => {
    const today = new Date();
    const dailyRewards = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      
      const baseReward = 10 + (i * 5); // Increasing rewards throughout the week
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      const isClaimed = rewards.some(r => 
        r.type === 'daily' && 
        new Date(r.created_at).toDateString() === date.toDateString() &&
        r.status === 'claimed'
      );
      
      dailyRewards.push({
        id: `daily-${i}`,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        date: date.toLocaleDateString(),
        reward: baseReward,
        isToday,
        isPast,
        isClaimed,
        canClaim: isToday && !isClaimed
      });
    }
    
    return dailyRewards;
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('gamification.rewards')}
        </h1>
        
        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
              <div className="flex items-center">
                <Coins className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-yellow-100 text-sm">{t('gamification.totalCoins')}</p>
                  <p className="text-2xl font-bold">{userStats.coins.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center">
                <Gift className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-green-100 text-sm">{t('gamification.rewardsClaimed')}</p>
                  <p className="text-2xl font-bold">{userStats.rewards_claimed || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-purple-100 text-sm">{t('gamification.loginStreak')}</p>
                  <p className="text-2xl font-bold">{userStats.login_streak || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {(['daily', 'achievements', 'milestones'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t(`gamification.${tab}Rewards`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Daily Login Streak */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('gamification.dailyLoginRewards')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('gamification.dailyLoginDescription')}
            </p>
            
            <div className="grid grid-cols-7 gap-2">
              {getDailyRewards().map((day, index) => (
                <div
                  key={day.id}
                  className={`relative p-4 rounded-lg border-2 text-center transition-all ${
                    day.isClaimed
                      ? 'border-green-200 bg-green-50'
                      : day.canClaim
                      ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-200'
                      : day.isPast
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {day.isClaimed && (
                    <div className="absolute -top-2 -right-2">
                      <CheckCircle className="w-6 h-6 text-green-600 bg-white rounded-full" />
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <Coins className={`w-6 h-6 mx-auto ${
                      day.isClaimed ? 'text-green-600' :
                      day.canClaim ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                  </div>
                  
                  <p className="text-xs font-medium text-gray-900 mb-1">
                    {day.day}
                  </p>
                  
                  <p className={`text-lg font-bold ${
                    day.isClaimed ? 'text-green-600' :
                    day.canClaim ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    {day.reward}
                  </p>
                  
                  {day.canClaim && (
                    <button
                      onClick={() => claimReward(day.id)}
                      disabled={claimingReward === day.id}
                      className="mt-2 w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {claimingReward === day.id ? t('common.processing') : t('gamification.claim')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.filter(r => r.type === 'achievement').length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('gamification.noAchievements')}
              </h3>
              <p className="text-gray-600">
                {t('gamification.noAchievementsDescription')}
              </p>
            </div>
          ) : (
            rewards.filter(r => r.type === 'achievement').map((reward) => (
              <div key={reward.id} className="bg-white rounded-lg border overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${getRewardColor(reward.type)}`}></div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${getRewardColor(reward.type)} rounded-lg text-white`}>
                      {getRewardIcon(reward.type)}
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(reward.status)}`}>
                      {getStatusIcon(reward.status)}
                      <span className="ml-1">{t(`gamification.status.${reward.status}`)}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {reward.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {reward.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Coins className="w-4 h-4 mr-1" />
                      <span>{reward.reward_amount} {t('gamification.coins')}</span>
                    </div>
                    
                    {reward.status === 'available' && (
                      <button
                        onClick={() => claimReward(reward.id)}
                        disabled={claimingReward === reward.id}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {claimingReward === reward.id ? t('common.processing') : t('gamification.claim')}
                      </button>
                    )}
                  </div>
                  
                  {reward.progress !== undefined && reward.target && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{t('gamification.progress')}</span>
                        <span>{reward.progress}/{reward.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getRewardColor(reward.type)}`}
                          style={{ width: `${Math.min((reward.progress / reward.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-4">
          {rewards.filter(r => r.type === 'milestone').length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('gamification.noMilestones')}
              </h3>
              <p className="text-gray-600">
                {t('gamification.noMilestonesDescription')}
              </p>
            </div>
          ) : (
            rewards.filter(r => r.type === 'milestone').map((reward) => (
              <div key={reward.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 bg-gradient-to-r ${getRewardColor(reward.type)} rounded-lg text-white mr-4`}>
                      {getRewardIcon(reward.type)}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reward.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <Coins className="w-4 h-4 mr-1" />
                        <span>{reward.reward_amount} {t('gamification.coins')}</span>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(reward.status)}`}>
                      {getStatusIcon(reward.status)}
                      <span className="ml-1">{t(`gamification.status.${reward.status}`)}</span>
                    </div>
                    
                    {reward.status === 'available' && (
                      <button
                        onClick={() => claimReward(reward.id)}
                        disabled={claimingReward === reward.id}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {claimingReward === reward.id ? t('common.processing') : t('gamification.claim')}
                      </button>
                    )}
                  </div>
                </div>
                
                {reward.progress !== undefined && reward.target && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{t('gamification.progress')}</span>
                      <span>{reward.progress}/{reward.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getRewardColor(reward.type)}`}
                        style={{ width: `${Math.min((reward.progress / reward.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RewardSystem;