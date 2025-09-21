import React from 'react';
import { Clock, Star, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Story } from '../types/story';

interface StoryCardProps {
  story: Story;
  progress: {
    endingsUnlocked: number;
    totalEndings: number;
    isCompleted: boolean;
    progressPercentage: number;
  };
  onPlay: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, progress, onPlay }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={story.image}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{story.estimatedTime} min</span>
          </div>
        </div>
        {progress.isCompleted && (
          <div className="absolute top-4 right-4">
            <div className="bg-emerald-500 text-white p-2 rounded-full">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {story.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
          {story.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              by {story.author}
            </span>
          </div>
          
          {progress.endingsUnlocked > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {progress.endingsUnlocked}/{progress.totalEndings} endings
            </div>
          )}
        </div>

        {progress.progressPercentage > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-4">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={onPlay}
          className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {progress.isCompleted ? t('stories.playAgain') : t('stories.startStory')}
        </button>
      </div>
    </div>
  );
};