import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { CommunityStory, StoryScene } from '../../types/community';

interface StoryPreviewProps {
  story: CommunityStory;
  onClose: () => void;
}

const StoryPreview: React.FC<StoryPreviewProps> = ({ story, onClose }) => {
  const { t } = useTranslation();
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(
    story.scenes?.[0]?.id || null
  );
  const [gameStats, setGameStats] = useState<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentScene = story.scenes?.find(scene => scene.id === currentSceneId);

  const startStory = () => {
    setCurrentSceneId(story.scenes?.[0]?.id || null);
    setGameStats({});
    setIsPlaying(true);
  };

  const resetStory = () => {
    setCurrentSceneId(story.scenes?.[0]?.id || null);
    setGameStats({});
    setIsPlaying(false);
  };

  const selectOption = (optionId: string) => {
    const option = currentScene?.options.find(opt => opt.id === optionId);
    if (!option) return;

    // Apply consequences
    if (option.consequences) {
      const newStats = { ...gameStats };
      Object.entries(option.consequences).forEach(([stat, value]) => {
        newStats[stat] = (newStats[stat] || 0) + value;
      });
      setGameStats(newStats);
    }

    // Navigate to next scene
    if (option.next_scene_id === 'END' || !option.next_scene_id) {
      setIsPlaying(false);
      setCurrentSceneId(null);
    } else {
      setCurrentSceneId(option.next_scene_id);
    }
  };

  const canSelectOption = (option: any) => {
    if (!option.requirements) return true;
    
    return Object.entries(option.requirements).every(([stat, required]) => {
      return (gameStats[stat] || 0) >= required;
    });
  };

  if (!story.scenes || story.scenes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('editor.preview')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <p className="text-gray-500">{t('editor.noScenesPreview')}</p>
            <p className="text-sm text-gray-400 mt-2">{t('editor.addScenesFirst')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {story.title || t('editor.untitledStory')}
            </h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {t('editor.preview')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={resetStory}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('editor.restart')}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Stats */}
        {Object.keys(gameStats).length > 0 && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-3">
              {Object.entries(gameStats).map(([stat, value]) => (
                <div key={stat} className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full border">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {stat.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {value > 0 ? '+' : ''}{value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!isPlaying ? (
            /* Start Screen */
            <div className="flex flex-col items-center justify-center p-8 min-h-96">
              <div className="text-center max-w-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {story.title}
                </h3>
                
                {story.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {story.description}
                  </p>
                )}
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-sm text-gray-600">{t('editor.category')}:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {t(`categories.${story.category}`)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-sm text-gray-600">{t('editor.difficulty')}:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {t(`difficulties.${story.difficulty}`)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-sm text-gray-600">{t('editor.duration')}:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {story.estimated_duration} {t('editor.minutes')}
                    </span>
                  </div>
                </div>
                
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {story.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={startStory}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-lg font-medium"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t('editor.startStory')}
                </button>
              </div>
            </div>
          ) : currentScene ? (
            /* Game Scene */
            <div className="p-6">
              {/* Scene Image */}
              {currentScene.image_url && (
                <div className="mb-6">
                  <img
                    src={currentScene.image_url}
                    alt={currentScene.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Scene Content */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {currentScene.title}
                </h3>
                <div className="prose prose-gray max-w-none">
                  {currentScene.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              
              {/* Options */}
              <div className="space-y-3">
                {currentScene.options.map((option, index) => {
                  const canSelect = canSelectOption(option);
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => canSelect && selectOption(option.id)}
                      disabled={!canSelect}
                      className={`w-full p-4 text-left rounded-lg border transition-colors ${
                        canSelect
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className={canSelect ? 'text-gray-900' : 'text-gray-400'}>
                            {option.text}
                          </p>
                          
                          {/* Requirements */}
                          {option.requirements && Object.keys(option.requirements).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(option.requirements).map(([stat, required]) => (
                                <span
                                  key={stat}
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    (gameStats[stat] || 0) >= required
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {stat.replace('_', ' ')}: {required}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* End Screen */
            <div className="flex flex-col items-center justify-center p-8 min-h-96">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('editor.storyComplete')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('editor.thanksForPlaying')}
                </p>
                
                {Object.keys(gameStats).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      {t('editor.finalStats')}
                    </h4>
                    <div className="flex flex-wrap justify-center gap-3">
                      {Object.entries(gameStats).map(([stat, value]) => (
                        <div key={stat} className="px-4 py-2 bg-gray-100 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {stat.replace('_', ' ')}: 
                          </span>
                          <span className="text-sm font-bold text-blue-600 ml-1">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={startStory}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('editor.playAgain')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryPreview;