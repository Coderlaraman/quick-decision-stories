import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// Removed local useGameState hook usage to prevent separate state instances
import { Story } from '../types/story';
import { StoryCard } from '../components/StoryCard';
import { UserStats } from '../components/UserStats';
import type { GameState } from '../types/story';

interface HomeProps {
  gameState: GameState;
  stories: Story[];
  startStory: (storyId: string) => void;
  getStoryProgress: (storyId: string) => {
    endingsUnlocked: number;
    totalEndings: number;
    isCompleted: boolean;
    progressPercentage: number;
  };
}

export default function Home({
  gameState,
  stories,
  startStory,
  getStoryProgress,
}: HomeProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* User Stats */}
      <UserStats userProgress={gameState.userProgress} />

      {/* Stories Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('stories.availableStories')}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              progress={getStoryProgress(story.id)}
              onPlay={() => startStory(story.id)}
            />
          ))}
        </div>
      </div>

      {/* How to Play */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          How to Play
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('features.chooseStory')}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('features.chooseStoryDescription')}
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('features.quickDecisions')}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('features.quickDecisionsDescription')}
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-amber-600 dark:text-amber-400 font-bold">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('features.unlockEndings')}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('features.unlockEndingsDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}