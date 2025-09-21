import React from 'react';
import { Trophy, Star, Clock, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProgress } from '../types/story';

interface UserStatsProps {
  userProgress: UserProgress;
}

export const UserStats: React.FC<UserStatsProps> = ({ userProgress }) => {
  const { t } = useTranslation();
  const totalEndingsUnlocked = Object.values(userProgress.unlockedEndings).reduce(
    (sum, endings) => sum + endings.length,
    0
  );

  const achievements = [
    {
      id: 'explorer',
      name: t('stats.explorer'),
      description: t('stats.explorerDescription'),
      icon: <Star className="w-5 h-5" />,
      unlocked: userProgress.achievements.includes('explorer')
    },
    {
      id: 'storyteller',
      name: t('stats.storyteller'),
      description: t('stats.storytellerDescription'),
      icon: <BookOpen className="w-5 h-5" />,
      unlocked: userProgress.achievements.includes('storyteller')
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-amber-500" />
        {t('stats.yourProgress')}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userProgress.completedStories.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('stats.storiesCompleted')}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalEndingsUnlocked}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('stats.endingsUnlocked')}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userProgress.achievements.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('stats.achievements')}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userProgress.totalPlayTime}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('stats.sessionsPlayed')}
          </div>
        </div>
      </div>

      {achievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('stats.achievementsTitle')}
          </h3>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800'
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div
                  className={`${
                    achievement.unlocked
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      achievement.unlocked
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {achievement.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </div>
                </div>
                {achievement.unlocked && (
                  <Trophy className="w-5 h-5 text-amber-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};