import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Crown, Star, Play, Calendar, Users, Eye, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionApi } from '../../lib/api/subscriptionApi';

interface ExclusiveStory {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  coverImage?: string;
  category: string;
  duration: number;
  publishedAt: string;
  requiredTier: 'premium' | 'pro' | 'ultimate';
  views: number;
  likes: number;
  isLiked?: boolean;
  isNew?: boolean;
  tags: string[];
}

interface ExclusiveEvent {
  id: string;
  title: string;
  description: string;
  type: 'live_reading' | 'author_qa' | 'workshop' | 'premiere';
  scheduledAt: string;
  duration: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  requiredTier: 'premium' | 'pro' | 'ultimate';
  participants?: number;
  maxParticipants?: number;
  isRegistered?: boolean;
}

interface ExclusiveContentProps {
  userTier?: string;
}

export const ExclusiveContent: React.FC<ExclusiveContentProps> = ({ userTier }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stories, setStories] = useState<ExclusiveStory[]>([]);
  const [events, setEvents] = useState<ExclusiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stories' | 'events' | 'collections'>('stories');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadExclusiveContent();
  }, []);

  const loadExclusiveContent = async () => {
    try {
      setLoading(true);
      const [storiesResponse, eventsResponse] = await Promise.all([
        subscriptionApi.getExclusiveStories(),
        subscriptionApi.getExclusiveEvents()
      ]);
      
      setStories(storiesResponse.data || []);
      setEvents(eventsResponse.data || []);
    } catch (error) {
      console.error('Error loading exclusive content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    try {
      await subscriptionApi.likeStory(storyId);
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, isLiked: !story.isLiked, likes: story.isLiked ? story.likes - 1 : story.likes + 1 }
          : story
      ));
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      await subscriptionApi.registerForEvent(eventId);
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, isRegistered: !event.isRegistered }
          : event
      ));
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const canAccessContent = (requiredTier: string) => {
    if (!userTier) return false;
    
    const tierLevels = { premium: 1, pro: 2, ultimate: 3 };
    const userLevel = tierLevels[userTier as keyof typeof tierLevels] || 0;
    const requiredLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0;
    
    return userLevel >= requiredLevel;
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'pro':
        return <Star className="w-4 h-4 text-blue-500" />;
      case 'ultimate':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      default:
        return <Lock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'pro':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'ultimate':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'live_reading':
        return <Play className="w-5 h-5" />;
      case 'author_qa':
        return <Users className="w-5 h-5" />;
      case 'workshop':
        return <Star className="w-5 h-5" />;
      case 'premiere':
        return <Crown className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const filteredStories = selectedCategory === 'all' 
    ? stories 
    : stories.filter(story => story.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(stories.map(story => story.category)))];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userTier) {
    return (
      <div className="text-center py-12">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('subscription.exclusiveContentLocked')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('subscription.exclusiveContentDescription')}
        </p>
        <button
          onClick={() => window.location.href = '/subscription/plans'}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
        >
          {t('subscription.upgradeToPremium')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-yellow-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('subscription.exclusiveContent')}
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('subscription.exclusiveContentSubtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'stories'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('subscription.exclusiveStories')}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('subscription.exclusiveEvents')}
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'collections'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('subscription.exclusiveCollections')}
          </button>
        </div>
      </div>

      {/* Stories Tab */}
      {activeTab === 'stories' && (
        <div>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category === 'all' ? t('common.all') : category}
              </button>
            ))}
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => {
              const hasAccess = canAccessContent(story.requiredTier);
              
              return (
                <div
                  key={story.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl ${
                    !hasAccess ? 'opacity-75' : ''
                  }`}
                >
                  {/* Story Image */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
                    {story.coverImage && (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Tier Badge */}
                    <div className="absolute top-3 left-3">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(story.requiredTier)}`}>
                        {getTierIcon(story.requiredTier)}
                        <span>{story.requiredTier}</span>
                      </div>
                    </div>

                    {/* New Badge */}
                    {story.isNew && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {t('common.new')}
                        </div>
                      </div>
                    )}

                    {/* Lock Overlay */}
                    {!hasAccess && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Story Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {story.description}
                    </p>

                    {/* Author */}
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-3">
                        {story.author.avatar && (
                          <img
                            src={story.author.avatar}
                            alt={story.author.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {story.author.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(story.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {story.views}
                        </div>
                        <div className="flex items-center">
                          <Heart className={`w-4 h-4 mr-1 ${story.isLiked ? 'text-red-500 fill-current' : ''}`} />
                          {story.likes}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {story.duration} {t('common.minutes')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        disabled={!hasAccess}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          hasAccess
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Play className="w-4 h-4 inline mr-2" />
                        {hasAccess ? t('common.play') : t('subscription.upgradeRequired')}
                      </button>
                      <button
                        onClick={() => handleLikeStory(story.id)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${story.isLiked ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-400'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {events.map((event) => {
            const hasAccess = canAccessContent(event.requiredTier);
            const isUpcoming = new Date(event.scheduledAt) > new Date();
            
            return (
              <div
                key={event.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl ${
                  !hasAccess ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center space-x-2 mr-4">
                        {getEventTypeIcon(event.type)}
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t(`subscription.eventType.${event.type}`)}
                        </span>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(event.requiredTier)}`}>
                        {getTierIcon(event.requiredTier)}
                        <span>{event.requiredTier}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {event.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(event.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {event.participants || 0}
                        {event.maxParticipants && `/${event.maxParticipants}`}
                      </div>
                      <div>
                        {event.duration} {t('common.minutes')}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-3">
                        {event.author.avatar && (
                          <img
                            src={event.author.avatar}
                            alt={event.author.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        )}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {event.author.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    {hasAccess ? (
                      <button
                        onClick={() => handleRegisterEvent(event.id)}
                        disabled={!isUpcoming}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          event.isRegistered
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : isUpcoming
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {event.isRegistered
                          ? t('subscription.registered')
                          : isUpcoming
                          ? t('subscription.register')
                          : t('subscription.eventPassed')
                        }
                      </button>
                    ) : (
                      <div className="text-center">
                        <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t('subscription.upgradeRequired')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collections Tab */}
      {activeTab === 'collections' && (
        <div className="text-center py-12">
          <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('subscription.collectionsComingSoon')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subscription.collectionsDescription')}
          </p>
        </div>
      )}
    </div>
  );
};