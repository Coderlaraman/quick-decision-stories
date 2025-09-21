import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageCircle, ThumbsUp, ThumbsDown, Flag, Award, TrendingUp, Users, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reputationApi } from '../../lib/api/reputation';

interface Rating {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  storyId: string;
  storyTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  isReported: boolean;
}

interface UserReputation {
  userId: string;
  userName: string;
  userAvatar: string;
  totalRatings: number;
  averageRating: number;
  totalLikes: number;
  totalComments: number;
  reputationScore: number;
  badges: string[];
  level: string;
  isFollowing: boolean;
}

interface ReputationStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  totalComments: number;
  totalLikes: number;
  topRatedStories: Array<{
    id: string;
    title: string;
    rating: number;
    ratingsCount: number;
  }>;
}

const ReputationSystem: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ratings' | 'leaderboard' | 'stats'>('ratings');
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [topUsers, setTopUsers] = useState<UserReputation[]>([]);
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'likes'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReputationData();
  }, [activeTab, filterRating, sortBy, searchQuery]);

  const loadReputationData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'ratings') {
        const ratingsData = await reputationApi.getRatings({
          rating: filterRating,
          sortBy,
          search: searchQuery
        });
        setRatings(ratingsData);
      } else if (activeTab === 'leaderboard') {
        const leaderboardData = await reputationApi.getTopUsers();
        setTopUsers(leaderboardData);
      } else if (activeTab === 'stats') {
        const statsData = await reputationApi.getReputationStats();
        setStats(statsData);
      }
    } catch (err) {
      setError(t('reputation.errorLoading'));
      console.error('Error loading reputation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeRating = async (ratingId: string) => {
    try {
      await reputationApi.likeRating(ratingId);
      setRatings(prev => prev.map(rating => 
        rating.id === ratingId 
          ? { 
              ...rating, 
              likes: rating.isLiked ? rating.likes - 1 : rating.likes + 1,
              dislikes: rating.isDisliked ? rating.dislikes - 1 : rating.dislikes,
              isLiked: !rating.isLiked,
              isDisliked: false
            }
          : rating
      ));
    } catch (err) {
      console.error('Error liking rating:', err);
    }
  };

  const handleDislikeRating = async (ratingId: string) => {
    try {
      await reputationApi.dislikeRating(ratingId);
      setRatings(prev => prev.map(rating => 
        rating.id === ratingId 
          ? { 
              ...rating, 
              dislikes: rating.isDisliked ? rating.dislikes - 1 : rating.dislikes + 1,
              likes: rating.isLiked ? rating.likes - 1 : rating.likes,
              isDisliked: !rating.isDisliked,
              isLiked: false
            }
          : rating
      ));
    } catch (err) {
      console.error('Error disliking rating:', err);
    }
  };

  const handleReportRating = async (ratingId: string) => {
    try {
      await reputationApi.reportRating(ratingId);
      setRatings(prev => prev.map(rating => 
        rating.id === ratingId 
          ? { ...rating, isReported: true }
          : rating
      ));
    } catch (err) {
      console.error('Error reporting rating:', err);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await reputationApi.followUser(userId);
      setTopUsers(prev => prev.map(user => 
        user.userId === userId 
          ? { ...user, isFollowing: !user.isFollowing }
          : user
      ));
    } catch (err) {
      console.error('Error following user:', err);
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

  const renderRatingDistribution = () => {
    if (!stats) return null;

    const maxCount = Math.max(...Object.values(stats.ratingDistribution));

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('reputation.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadReputationData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('reputation.title')}
        </h1>
        <p className="text-gray-600">
          {t('reputation.description')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'ratings', label: t('reputation.ratings'), icon: Star },
          { key: 'leaderboard', label: t('reputation.leaderboard'), icon: Award },
          { key: 'stats', label: t('reputation.statistics'), icon: TrendingUp }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Ratings Tab */}
      {activeTab === 'ratings' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('reputation.filterByRating')}
              </label>
              <select
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('reputation.allRatings')}</option>
                {[5, 4, 3, 2, 1].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} {t('reputation.stars')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('reputation.sortBy')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{t('reputation.newest')}</option>
                <option value="oldest">{t('reputation.oldest')}</option>
                <option value="rating">{t('reputation.highestRated')}</option>
                <option value="likes">{t('reputation.mostLiked')}</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('reputation.search')}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('reputation.searchPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Ratings List */}
          <div className="space-y-4">
            {ratings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {t('reputation.noRatings')}
              </div>
            ) : (
              ratings.map((rating) => (
                <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={rating.userAvatar}
                        alt={rating.userName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{rating.userName}</h4>
                        <p className="text-sm text-gray-500">
                          {t('reputation.reviewedStory')}: {rating.storyTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(rating.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{rating.comment}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLikeRating(rating.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                          rating.isLiked
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{rating.likes}</span>
                      </button>

                      <button
                        onClick={() => handleDislikeRating(rating.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                          rating.isDisliked
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{rating.dislikes}</span>
                      </button>
                    </div>

                    {!rating.isReported && rating.userId !== user?.id && (
                      <button
                        onClick={() => handleReportRating(rating.id)}
                        className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                        <span>{t('reputation.report')}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div>
          <div className="grid gap-6">
            {topUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {t('reputation.noUsers')}
              </div>
            ) : (
              topUsers.map((userRep, index) => (
                <div key={userRep.userId} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={userRep.userAvatar}
                          alt={userRep.userName}
                          className="w-16 h-16 rounded-full"
                        />
                        {index < 3 && (
                          <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{userRep.userName}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          {renderStars(userRep.averageRating)}
                          <span className="text-sm text-gray-600">
                            ({userRep.totalRatings} {t('reputation.reviews')})
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{userRep.totalLikes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{userRep.totalComments}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>{userRep.reputationScore}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {userRep.level}
                        </span>
                      </div>
                      {userRep.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {userRep.badges.slice(0, 3).map((badge, badgeIndex) => (
                            <span
                              key={badgeIndex}
                              className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                            >
                              {badge}
                            </span>
                          ))}
                          {userRep.badges.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{userRep.badges.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      {userRep.userId !== user?.id && (
                        <button
                          onClick={() => handleFollowUser(userRep.userId)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            userRep.isFollowing
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {userRep.isFollowing ? t('reputation.unfollow') : t('reputation.follow')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('reputation.overallStats')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalRatings}</div>
                <div className="text-sm text-gray-600">{t('reputation.totalRatings')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">{t('reputation.averageRating')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalComments}</div>
                <div className="text-sm text-gray-600">{t('reputation.totalComments')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.totalLikes}</div>
                <div className="text-sm text-gray-600">{t('reputation.totalLikes')}</div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('reputation.ratingDistribution')}
            </h3>
            {renderRatingDistribution()}
          </div>

          {/* Top Rated Stories */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('reputation.topRatedStories')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topRatedStories.map((story) => (
                <div key={story.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{story.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(story.rating, 'sm')}
                      <span className="text-sm text-gray-600">{story.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {story.ratingsCount} {t('reputation.reviews')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationSystem;