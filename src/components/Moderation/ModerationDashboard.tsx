import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Check, X, Flag, AlertTriangle, Clock, Filter } from 'lucide-react';
import { CommunityStory, ModerationStatus } from '../../types/community';
import { communityApi } from '../../lib/api/community';

interface ModerationDashboardProps {
  userRole: 'admin' | 'moderator';
}

const ModerationDashboard: React.FC<ModerationDashboardProps> = ({ userRole }) => {
  const { t } = useTranslation();
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ModerationStatus | 'all'>('pending');
  const [selectedStory, setSelectedStory] = useState<CommunityStory | null>(null);
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    loadStories();
  }, [filter]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await communityApi.getStoriesForModeration({
        status: filter === 'all' ? undefined : filter,
        limit: 50
      });
      setStories(response.data);
    } catch (error) {
      console.error('Error loading stories for moderation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (storyId: string, status: ModerationStatus, reason?: string) => {
    try {
      await communityApi.moderateStory(storyId, {
        status,
        reason: reason || moderationReason,
        moderator_notes: reason || moderationReason
      });
      
      // Update local state
      setStories(prev => prev.filter(story => story.id !== storyId));
      setSelectedStory(null);
      setModerationReason('');
    } catch (error) {
      console.error('Error moderating story:', error);
    }
  };

  const getStatusIcon = (status: ModerationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ModerationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('moderation.dashboard')}
        </h1>
        <p className="text-gray-600">
          {t('moderation.dashboardDescription')}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex space-x-2">
          {(['all', 'pending', 'flagged', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`moderation.status.${status}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stories List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                {t('moderation.storiesForReview')} ({stories.length})
              </h2>
            </div>
            <div className="divide-y">
              {stories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('moderation.noStoriesFound')}</p>
                </div>
              ) : (
                stories.map((story) => (
                  <div
                    key={story.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedStory?.id === story.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedStory(story)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{story.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(story.moderation_status)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(story.moderation_status)}
                              <span>{t(`moderation.status.${story.moderation_status}`)}</span>
                            </div>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {story.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{t('stories.category')}: {t(`categories.${story.category}`)}</span>
                          <span>{t('stories.difficulty')}: {t(`difficulties.${story.difficulty}`)}</span>
                          <span>{t('stories.author')}: {story.author_name}</span>
                        </div>
                      </div>
                      <button
                        className="ml-4 p-2 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStory(story);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Story Details & Actions */}
        <div className="lg:col-span-1">
          {selectedStory ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{t('moderation.storyDetails')}</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedStory.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{selectedStory.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('stories.category')}:</span>
                      <span>{t(`categories.${selectedStory.category}`)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('stories.difficulty')}:</span>
                      <span>{t(`difficulties.${selectedStory.difficulty}`)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('stories.author')}:</span>
                      <span>{selectedStory.author_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('moderation.scenes')}:</span>
                      <span>{selectedStory.scenes?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {selectedStory.content_warnings && selectedStory.content_warnings.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">{t('editor.contentWarnings')}</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedStory.content_warnings.map((warning) => (
                        <span
                          key={warning}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                        >
                          {t(`contentWarnings.${warning}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStory.moderation_status === 'pending' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('moderation.reason')}
                      </label>
                      <textarea
                        value={moderationReason}
                        onChange={(e) => setModerationReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder={t('moderation.reasonPlaceholder')}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModeration(selectedStory.id, 'approved')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t('moderation.approve')}</span>
                      </button>
                      <button
                        onClick={() => handleModeration(selectedStory.id, 'rejected')}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>{t('moderation.reject')}</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleModeration(selectedStory.id, 'flagged')}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Flag className="w-4 h-4" />
                      <span>{t('moderation.flag')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('moderation.selectStoryToReview')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationDashboard;