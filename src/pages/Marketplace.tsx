import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Search, Star, Users, Coins, ShoppingBag, DollarSign } from 'lucide-react';
import MarketplaceGrid from '../components/Marketplace/MarketplaceGrid';
import StoryDetails from '../components/Marketplace/StoryDetails';
import PaymentSystem from '../components/Marketplace/PaymentSystem';
import CommissionSystem from '../components/Marketplace/CommissionSystem';
import { PremiumStory, MarketplaceStats } from '../types/marketplace';
import { UserCurrency } from '../types/community';
import { marketplaceApi } from '../lib/api/marketplace';
import { communityApi } from '../lib/api/community';
import { useAuth } from '../contexts/AuthContext';

const Marketplace: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'details' | 'author' | 'purchased'>('browse');
  const [selectedStory, setSelectedStory] = useState<PremiumStory | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    story?: PremiumStory;
  }>({ isOpen: false });
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [userCurrency, setUserCurrency] = useState<UserCurrency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const statsResponse = await marketplaceApi.getStats();
        setStats(statsResponse.data);
        
        if (user) {
          loadUserCurrency();
        }
      } catch (error) {
        console.error('Error loading marketplace data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const loadUserCurrency = async () => {
    try {
      const response = await communityApi.getUserCurrency();
      if (response.data) {
        setUserCurrency(response.data);
      }
    } catch (error) {
      console.error('Error loading user currency:', error);
    }
  };

  const handleStorySelect = (story: PremiumStory) => {
    setSelectedStory(story);
    setActiveTab('details');
  };

  const handlePurchaseClick = async (storyId: string) => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    try {
      await marketplaceApi.purchaseStory(storyId, 'coins');
      // Refresh user currency after purchase
      loadUserCurrency();
      // Show success message
      alert(`Successfully purchased story!`);
    } catch (error) {
      console.error('Error purchasing story:', error);
      alert('Failed to purchase story. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModal({ isOpen: false });
    // Refresh the story data or redirect to purchased stories
    if (selectedStory) {
      // Update the selected story to show as purchased
      setSelectedStory(prev => prev ? { ...prev, isPurchased: true } : null);
    }
  };

  const handlePlayStory = (story: PremiumStory) => {
    // Navigate to story player or game interface
    console.log('Playing story:', story.id);
    // This would typically navigate to a story player component
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'browse':
        return (
          <MarketplaceGrid
            onStorySelect={handleStorySelect}
          />
        );
        
      case 'details':
        return selectedStory ? (
          <StoryDetails
            storyId={selectedStory.id}
            onBack={() => setActiveTab('browse')}
            onPurchase={handlePurchaseClick}
            onPlay={handlePlayStory}
          />
        ) : null;
        
      case 'author':
        return user?.role === 'author' ? (
          <CommissionSystem />
        ) : (
          <div className="text-center py-12">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('marketplace.authorOnly')}
            </h3>
            <p className="text-gray-600">
              {t('marketplace.authorOnlyDescription')}
            </p>
          </div>
        );
        
      case 'purchased':
        return (
          <MarketplaceGrid
            onStorySelect={handleStorySelect}
          />
        );
        
      default:
        return null;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Crown className="w-8 h-8 text-yellow-500 mr-3" />
                  {t('marketplace.title')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('marketplace.subtitle')}
                </p>
              </div>
              
              {user && userCurrency && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{t('marketplace.yourBalance')}</p>
                    <p className="font-bold text-lg flex items-center">
                      <Coins className="w-5 h-5 text-yellow-500 mr-1" />
                      {userCurrency.coins || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  <span className="text-2xl font-bold">{stats.totalStories.toLocaleString()}</span>
                </div>
                <p className="text-sm opacity-90">{t('marketplace.totalStories')}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="text-2xl font-bold">{stats.totalAuthors.toLocaleString()}</span>
                </div>
                <p className="text-sm opacity-90">{t('marketplace.totalAuthors')}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-5 h-5 mr-2" />
                  <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
                </div>
                <p className="text-sm opacity-90">{t('marketplace.averageRating')}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="text-2xl font-bold">{stats.totalSales.toLocaleString()}</span>
                </div>
                <p className="text-sm opacity-90">{t('marketplace.totalSales')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'browse', label: t('marketplace.browse'), icon: Search },
              { id: 'purchased', label: t('marketplace.myStories'), icon: ShoppingBag },
              ...(user?.role === 'author' ? [{ id: 'author', label: t('marketplace.authorDashboard'), icon: DollarSign }] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Payment Modal */}
      {paymentModal.isOpen && paymentModal.story && (
        <PaymentSystem
          amount={paymentModal.story.price}
          currency={paymentModal.story.price === 0 ? 'coins' : 'USD'}
          itemId={paymentModal.story.id}
          itemType="story"
          itemName={paymentModal.story.title}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setPaymentModal({ isOpen: false })}
          isOpen={paymentModal.isOpen}
        />
      )}
    </div>
  );
};

export default Marketplace;