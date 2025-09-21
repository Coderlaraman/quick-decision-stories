import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Award, MessageCircle, TrendingUp, Users, Heart, Trophy, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reputationApi } from '../lib/api/reputation';
import ReputationSystem from '../components/Reputation/ReputationSystem';
import CommentManager from '../components/Reputation/CommentManager';

interface UserStats {
  totalRatings: number;
  averageRating: number;
  totalComments: number;
  totalLikes: number;
  reputationScore: number;
  level: string;
  badges: string[];
  rank: number;
  totalUsers: number;
}

interface CommunityStats {
  totalRatings: number;
  totalComments: number;
  totalUsers: number;
  averageRating: number;
  topContributors: Array<{
    id: string;
    name: string;
    avatar: string;
    score: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'rating' | 'comment' | 'like';
    userName: string;
    storyTitle: string;
    createdAt: string;
  }>;
}

const Reputation: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'ratings' | 'comments' | 'community'>('overview');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReputationData();
  }, []);

  const loadReputationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userStatsData, communityStatsData] = await Promise.all([
        user ? reputationApi.getUserStats(user.id) : Promise.resolve(null),
        reputationApi.getCommunityStats()
      ]);

      setUserStats(userStatsData);
      setCommunityStats(communityStatsData);
    } catch (err) {
      setError(t('reputation.errorLoading'));
      console.error('Error loading reputation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bronze': return 'text-orange-600 bg-orange-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'diamond': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">{t('reputation.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4 text-lg">{error}</div>
        <button
          onClick={loadReputationData}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {t('reputation.title')}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t('reputation.heroDescription')}
            </p>
          </div>

          {/* Community Stats */}
          {communityStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{communityStats.totalRatings.toLocaleString()}</div>
                <div className="text-blue-100">{t('reputation.totalRatings')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{communityStats.totalComments.toLocaleString()}</div>
                <div className="text-blue-100">{t('reputation.totalComments')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{communityStats.totalUsers.toLocaleString()}</div>
                <div className="text-blue-100">{t('reputation.activeUsers')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{communityStats.averageRating.toFixed(1)}</div>
                <div className="text-blue-100">{t('reputation.averageRating')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* User Stats Card */}
        {user && userStats && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(userStats.level)}`}>
                      {userStats.level}
                    </span>
                    <span className="text-gray-600">
                      #{userStats.rank} {t('reputation.of')} {userStats.totalUsers}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {userStats.reputationScore}
                </div>
                <div className="text-gray-600">{t('reputation.reputationScore')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {renderStars(userStats.averageRating)}
                </div>
                <div className="text-2xl font-bold text-gray-900">{userStats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">
                  {t('reputation.averageRating')} ({userStats.totalRatings})
                </div>
              </div>
              
              <div className="text-center">
                <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{userStats.totalComments}</div>
                <div className="text-sm text-gray-600">{t('reputation.comments')}</div>
              </div>
              
              <div className="text-center">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{userStats.totalLikes}</div>
                <div className="text-sm text-gray-600">{t('reputation.likes')}</div>
              </div>
              
              <div className="text-center">
                <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{userStats.badges.length}</div>
                <div className="text-sm text-gray-600">{t('reputation.badges')}</div>
              </div>
            </div>

            {/* Badges */}
            {userStats.badges.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('reputation.yourBadges')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userStats.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow">
          {[
            { key: 'overview', label: t('reputation.overview'), icon: TrendingUp },
            { key: 'ratings', label: t('reputation.ratings'), icon: Star },
            { key: 'comments', label: t('reputation.comments'), icon: MessageCircle },
            { key: 'community', label: t('reputation.community'), icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors flex-1 justify-center ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Contributors */}
                {communityStats && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Trophy className="w-6 h-6 text-yellow-600 mr-2" />
                      {t('reputation.topContributors')}
                    </h3>
                    <div className="space-y-3">
                      {communityStats.topContributors.map((contributor, index) => (
                        <div key={contributor.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                          <img
                            src={contributor.avatar}
                            alt={contributor.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{contributor.name}</div>
                            <div className="text-sm text-gray-600">{contributor.score} {t('reputation.points')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {communityStats && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="w-6 h-6 text-blue-600 mr-2" />
                      {t('reputation.recentActivity')}
                    </h3>
                    <div className="space-y-3">
                      {communityStats.recentActivity.map((activity) => {
                        const getActivityIcon = () => {
                          switch (activity.type) {
                            case 'rating': return <Star className="w-4 h-4 text-yellow-600" />;
                            case 'comment': return <MessageCircle className="w-4 h-4 text-blue-600" />;
                            case 'like': return <Heart className="w-4 h-4 text-red-600" />;
                          }
                        };

                        const getActivityText = () => {
                          switch (activity.type) {
                            case 'rating': return t('reputation.ratedStory');
                            case 'comment': return t('reputation.commentedOnStory');
                            case 'like': return t('reputation.likedStory');
                          }
                        };

                        return (
                          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            {getActivityIcon()}
                            <div className="flex-1">
                              <div className="text-sm text-gray-900">
                                <span className="font-medium">{activity.userName}</span>
                                {' '}{getActivityText()}{' '}
                                <span className="font-medium">{activity.storyTitle}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ratings' && (
            <ReputationSystem />
          )}

          {activeTab === 'comments' && (
            <div className="p-6">
              <CommentManager userId={user?.id} />
            </div>
          )}

          {activeTab === 'community' && (
            <div className="p-6">
              <ReputationSystem />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reputation;