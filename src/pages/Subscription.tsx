import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Settings, CreditCard, Star, Gift, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionApi } from '../lib/api/subscriptionApi';
import { SubscriptionPlans } from '../components/Subscription/SubscriptionPlans';
import { SubscriptionManager } from '../components/Subscription/SubscriptionManager';
import { ExclusiveContent } from '../components/Subscription/ExclusiveContent';

interface SubscriptionStats {
  totalSubscribers: number;
  exclusiveStories: number;
  exclusiveEvents: number;
  averageRating: number;
}

interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  tier: 'premium' | 'pro' | 'ultimate';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
}

export const Subscription: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'plans' | 'manage' | 'exclusive' | 'benefits'>('plans');
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  useEffect(() => {
    // Set initial tab based on user subscription status
    if (userSubscription?.status === 'active') {
      setActiveTab('exclusive');
    } else {
      setActiveTab('plans');
    }
  }, [userSubscription]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [statsResponse, subscriptionResponse] = await Promise.all([
        subscriptionApi.getStats(),
        user ? subscriptionApi.getCurrentSubscription() : Promise.resolve({ data: null })
      ]);
      
      setStats(statsResponse.data);
      setUserSubscription(subscriptionResponse.data);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleSubscriptionSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    loadSubscriptionData();
    setActiveTab('exclusive');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Crown className="w-12 h-12 text-yellow-400 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">
                {t('subscription.title')}
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('subscription.subtitle')}
            </p>
            
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {stats.totalSubscribers.toLocaleString()}
                  </div>
                  <div className="text-blue-100">
                    {t('subscription.totalSubscribers')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {stats.exclusiveStories}
                  </div>
                  <div className="text-blue-100">
                    {t('subscription.exclusiveStories')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {stats.exclusiveEvents}
                  </div>
                  <div className="text-blue-100">
                    {t('subscription.exclusiveEvents')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-blue-100">
                    {t('subscription.averageRating')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'plans'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <Crown className="w-4 h-4 inline mr-2" />
              {t('subscription.plans')}
            </button>
            
            {userSubscription && (
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                {t('subscription.manage')}
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('exclusive')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'exclusive'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              {t('subscription.exclusiveContent')}
            </button>
            
            <button
              onClick={() => setActiveTab('benefits')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'benefits'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <Gift className="w-4 h-4 inline mr-2" />
              {t('subscription.benefits')}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'plans' && (
          <SubscriptionPlans
            onSelectPlan={handleSelectPlan}
            currentPlan={userSubscription?.planId}
          />
        )}
        
        {activeTab === 'manage' && userSubscription && (
          <SubscriptionManager />
        )}
        
        {activeTab === 'exclusive' && (
          <ExclusiveContent userTier={userSubscription?.tier} />
        )}
        
        {activeTab === 'benefits' && (
          <div className="space-y-8">
            {/* Benefits Overview */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('subscription.membershipBenefits')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('subscription.membershipBenefitsDescription')}
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('subscription.exclusiveStories')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subscription.exclusiveStoriesDescription')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('subscription.liveEvents')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subscription.liveEventsDescription')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('subscription.earlyAccess')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subscription.earlyAccessDescription')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('subscription.monthlyRewards')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subscription.monthlyRewardsDescription')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('subscription.prioritySupport')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subscription.prioritySupportDescription')}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t('subscription.adFreeExperience')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subscription.adFreeExperienceDescription')}
                </p>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                {t('subscription.whatMembersSay')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      M
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900 dark:text-white">Maria García</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Premium Member</div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{t('subscription.testimonial1')}"
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      J
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900 dark:text-white">John Smith</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Pro Member</div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{t('subscription.testimonial2')}"
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            {!userSubscription && (
              <div className="text-center">
                <button
                  onClick={() => setActiveTab('plans')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
                >
                  {t('subscription.startMembership')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('subscription.confirmSubscription')}
            </h3>
            <div className="mb-6">
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedPlan.name}
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${selectedPlan.price}/{selectedPlan.interval === 'monthly' ? t('subscription.month') : t('subscription.year')}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubscriptionSuccess}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('subscription.subscribe')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;