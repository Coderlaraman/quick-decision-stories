import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, Star, ShoppingBag, Gift, TrendingUp, History, Plus, Minus } from 'lucide-react';
import { UserStats, Transaction } from '../../types/community';
import { communityApi } from '../../lib/api/community';
import { useAuth } from '../../contexts/AuthContext';

interface VirtualEconomyProps {
  userId?: string;
  showTransactions?: boolean;
}

const VirtualEconomy: React.FC<VirtualEconomyProps> = ({ 
  userId, 
  showTransactions = true 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'shop'>('overview');

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      loadUserStats();
      if (showTransactions) {
        loadTransactions();
      }
    }
  }, [currentUserId, showTransactions]);

  const loadUserStats = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const response = await communityApi.getUserStats(currentUserId);
      setUserStats(response);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!currentUserId) return;
    
    try {
      setTransactionsLoading(true);
      const response = await communityApi.getUserTransactions(currentUserId, {
        limit: 20,
        offset: 0
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'spent':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-blue-600" />;
      case 'purchase':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
      case 'reward':
        return 'text-green-600';
      case 'spent':
      case 'purchase':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = ['earned', 'reward'].includes(type) ? '+' : '-';
    return `${sign}${Math.abs(amount).toLocaleString()}`;
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

  if (!userStats) {
    return (
      <div className="text-center py-12">
        <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('gamification.noStatsFound')}
        </h3>
        <p className="text-gray-600">
          {t('gamification.noStatsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('gamification.virtualEconomy')}
        </h1>
        
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  {t('gamification.points')}
                </p>
                <p className="text-3xl font-bold">
                  {userStats.points.toLocaleString()}
                </p>
                <p className="text-blue-100 text-xs mt-1">
                  {t('gamification.reputationScore')}
                </p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {userStats.total_earned?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">{t('gamification.totalEarned')}</p>
          </div>
          
          <div className="bg-white rounded-lg border p-4 text-center">
            <ShoppingBag className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {userStats.total_spent?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">{t('gamification.totalSpent')}</p>
          </div>
          
          <div className="bg-white rounded-lg border p-4 text-center">
            <Gift className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {userStats.rewards_claimed?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">{t('gamification.rewardsClaimed')}</p>
          </div>
          
          <div className="bg-white rounded-lg border p-4 text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {userStats.level || 1}
            </p>
            <p className="text-sm text-gray-600">{t('gamification.currentLevel')}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {showTransactions && (
        <div className="mb-6">
          <nav className="flex space-x-8">
            {(['overview', 'transactions', 'shop'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(`gamification.tabs.${tab}`)}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earning Opportunities */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('gamification.earningOpportunities')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {t('gamification.createStory')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('gamification.createStoryDescription')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+50</p>
                  <p className="text-xs text-gray-500">{t('gamification.coins')}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {t('gamification.completeStory')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('gamification.completeStoryDescription')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">+10</p>
                  <p className="text-xs text-gray-500">{t('gamification.points')}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Gift className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {t('gamification.dailyLogin')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('gamification.dailyLoginDescription')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">+5</p>
                  <p className="text-xs text-gray-500">{t('gamification.coins')}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Level Progress */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('gamification.levelProgress')}
            </h3>
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">
                  {userStats.level || 1}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {t('gamification.level')} {userStats.level || 1}
              </p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{t('gamification.progress')}</span>
                <span>{userStats.experience || 0}/{((userStats.level || 1) * 100)} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(((userStats.experience || 0) / ((userStats.level || 1) * 100)) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('gamification.nextLevelIn')} {' '}
                <span className="font-semibold">
                  {((userStats.level || 1) * 100) - (userStats.experience || 0)} XP
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center">
              <History className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('gamification.transactionHistory')}
              </h3>
            </div>
          </div>
          
          <div className="divide-y">
            {transactionsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{t('gamification.noTransactions')}</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.currency === 'coins' ? t('gamification.coins') : t('gamification.points')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('gamification.shopComingSoon')}
          </h3>
          <p className="text-gray-600">
            {t('gamification.shopDescription')}
          </p>
        </div>
      )}
    </div>
  );
};

export default VirtualEconomy;