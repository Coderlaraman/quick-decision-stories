import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Zap, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGameState } from './hooks/useGameState';
import { useAuth } from './hooks/useAuth';
import { GameInterface } from './components/GameInterface';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageSelector } from './components/LanguageSelector';
import { AuthModal } from './components/auth/AuthModal';
import { UserMenu } from './components/auth/UserMenu';
import { Navigation } from './components/Navigation';

// Import pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Gamification from './pages/Gamification';
import CreateStory from './pages/CreateStory';
import ModerationAdmin from './pages/ModerationAdmin';
import Payment from './pages/Payment';
import Reputation from './pages/Reputation';
import Subscription from './pages/Subscription';

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

  const { user } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quick Decision Stories
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <LanguageSelector />
              
              {user ? (
                 <UserMenu />
               ) : (
                 <button
                   onClick={() => openAuthModal('login')}
                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                 >
                   <LogIn className="w-4 h-4" />
                   {t('auth.signIn')}
                 </button>
               )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        <Routes>
          <Route
            path="/"
            element={(
              <Home
                gameState={gameState}
                stories={stories}
                startStory={startStory}
                getStoryProgress={getStoryProgress}
              />
            )}
          />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/create" element={<CreateStory />} />
          <Route path="/moderation" element={<ModerationAdmin />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/reputation" element={<Reputation />} />
          <Route path="/subscription" element={<Subscription />} />
        </Routes>
      </main>

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