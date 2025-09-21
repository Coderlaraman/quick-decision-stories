import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2 } from 'lucide-react';
import { CommunityStory } from '../../types/community';

interface StorySettingsProps {
  story: Partial<CommunityStory>;
  onUpdate: (updates: Partial<CommunityStory>) => void;
  onClose: () => void;
}

const StorySettings: React.FC<StorySettingsProps> = ({ story, onUpdate, onClose }) => {
  const { t } = useTranslation();
  const [newTag, setNewTag] = useState('');

  const categories = [
    'adventure',
    'mystery',
    'romance',
    'horror',
    'fantasy',
    'sci-fi',
    'drama',
    'comedy',
    'thriller',
    'historical'
  ];

  const difficulties = [
    'easy',
    'medium',
    'hard',
    'expert'
  ];

  const addTag = () => {
    if (newTag.trim() && !story.tags?.includes(newTag.trim())) {
      onUpdate({
        tags: [...(story.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({
      tags: story.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('editor.storySettings')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('editor.basicInformation')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('editor.storyTitle')}
              </label>
              <input
                type="text"
                value={story.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('editor.storyTitlePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('editor.storyDescription')}
              </label>
              <textarea
                value={story.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={t('editor.storyDescriptionPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('editor.category')}
                </label>
                <select
                  value={story.category || 'adventure'}
                  onChange={(e) => onUpdate({ category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {t(`categories.${category}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('editor.difficulty')}
                </label>
                <select
                  value={story.difficulty || 'medium'}
                  onChange={(e) => onUpdate({ difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {t(`difficulties.${difficulty}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('editor.estimatedDuration')} ({t('editor.minutes')})
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={story.estimated_duration || 15}
                onChange={(e) => onUpdate({ estimated_duration: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('editor.tags')}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {story.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('editor.addTagPlaceholder')}
              />
              <button
                onClick={addTag}
                disabled={!newTag.trim()}
                className="flex items-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Monetization */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('editor.monetization')}
            </h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_premium"
                checked={story.is_premium || false}
                onChange={(e) => onUpdate({ is_premium: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_premium" className="text-sm font-medium text-gray-700">
                {t('editor.premiumStory')}
              </label>
            </div>
            
            {story.is_premium && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('editor.price')} (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={story.price || 0}
                  onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {/* Content Warnings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('editor.contentWarnings')}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                'violence',
                'adult_content',
                'strong_language',
                'disturbing_themes',
                'drug_use',
                'gambling'
              ].map((warning) => (
                <div key={warning} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={warning}
                    checked={story.content_warnings?.includes(warning) || false}
                    onChange={(e) => {
                      const warnings = story.content_warnings || [];
                      if (e.target.checked) {
                        onUpdate({ content_warnings: [...warnings, warning] });
                      } else {
                        onUpdate({ content_warnings: warnings.filter(w => w !== warning) });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={warning} className="text-sm text-gray-700">
                    {t(`contentWarnings.${warning}`)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorySettings;