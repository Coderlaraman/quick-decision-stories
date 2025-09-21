import { useState } from 'react';
import { Zap, BookOpen, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGameState } from './hooks/useGameState';
import { useAuth } from './hooks/useAuth';
import { StoryCard } from './components/StoryCard';
import { GameInterface } from './components/GameInterface';
import { UserStats } from './components/UserStats';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageSelector } from './components/LanguageSelector';
import { AuthModal } from './components/auth/AuthModal';
import { UserMenu } from './components/auth/UserMenu';

function App() {
  const { t } = useTranslation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  const {
    gameState,
    isTimerActive,
    stories,
    startStory,
    makeChoice,
    restartStory,
    exitToHome,
    getStoryProgress
  } = useGameState();

  const { user, loading: authLoading } = useAuth();

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Show game interface if playing
  if (gameState.isPlaying && gameState.currentStory && gameState.currentScene) {
    return (
      <GameInterface
        gameState={gameState}
        isTimerActive={isTimerActive}
        onMakeChoice={makeChoice}
        onRestart={restartStory}
        onExit={exitToHome}
      />
    );
  }

  // Show home screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-3 rounded-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('app.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                    disabled={authLoading}
                  >
                    <LogIn className="w-4 h-4" />
                    {t('auth.login')}
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={authLoading}
                  >
                    {t('auth.register')}
                  </button>
                </div>
              )}
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default App;