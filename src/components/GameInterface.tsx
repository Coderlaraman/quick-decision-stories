import React from 'react';
import { ArrowLeft, RotateCcw, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Timer } from './Timer';
import { GameState } from '../types/story';

interface GameInterfaceProps {
  gameState: GameState;
  isTimerActive: boolean;
  onMakeChoice: (optionId: string) => void;
  onRestart: () => void;
  onExit: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  gameState,
  isTimerActive,
  onMakeChoice,
  onRestart,
  onExit
}) => {
  const { t } = useTranslation();
  const { currentStory, currentScene } = gameState;

  if (!currentStory || !currentScene) return null;

  const getEndingBadgeColor = (type?: string) => {
    switch (type) {
      case 'happy':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200';
      case 'tragic':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'mysterious':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'neutral':
        return 'bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onExit}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Exit to home"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStory.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentScene.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onRestart}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Restart story"
              >
                <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Scene Image */}
          {currentScene.image && (
            <div className="h-64 sm:h-80 relative overflow-hidden">
              <img
                src={currentScene.image}
                alt={currentScene.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Timer */}
            <Timer
              timeRemaining={gameState.timeRemaining}
              totalTime={10}
              isActive={isTimerActive}
            />

            {/* Scene Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {currentScene.content}
              </p>
            </div>

            {/* Ending Badge */}
            {currentScene.isEnding && currentScene.endingType && (
              <div className="mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEndingBadgeColor(currentScene.endingType)}`}>
                  {currentScene.endingType.charAt(0).toUpperCase() + currentScene.endingType.slice(1)} Ending
                </span>
              </div>
            )}

            {/* Options or Ending Actions */}
            {currentScene.isEnding ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={onRestart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    {t('game.tryDifferentChoices')}
                  </button>
                  <button
                    onClick={onExit}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    {t('game.backToStories')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentScene.options.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => onMakeChoice(option.id)}
                    disabled={!isTimerActive && gameState.timeRemaining <= 0}
                    className="w-full text-left p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-semibold group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                          {option.text}
                        </p>
                        {option.isDefault && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                            Default choice if time runs out
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {!isTimerActive && gameState.timeRemaining <= 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      Time's up! The default choice was selected automatically.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};