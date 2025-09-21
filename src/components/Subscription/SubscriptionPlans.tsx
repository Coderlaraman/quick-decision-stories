import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Check, Star, Zap, Gift, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionApi } from '../../lib/api/subscriptionApi';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  exclusive?: boolean;
  maxStories?: number;
  priority?: boolean;
}

interface SubscriptionPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  currentPlan?: string;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSelectPlan,
  currentPlan
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionApi.getPlans();
      setPlans(response.data || []);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => plan.interval === selectedInterval);

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'premium':
        return <Crown className="w-6 h-6" />;
      case 'pro':
        return <Star className="w-6 h-6" />;
      case 'ultimate':
        return <Zap className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'premium':
        return 'from-purple-500 to-pink-500';
      case 'pro':
        return 'from-blue-500 to-cyan-500';
      case 'ultimate':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('subscription.choosePlan')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {t('subscription.planDescription')}
        </p>
        
        {/* Interval Toggle */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedInterval('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedInterval === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('subscription.monthly')}
          </button>
          <button
            onClick={() => setSelectedInterval('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedInterval === 'yearly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('subscription.yearly')}
            <span className="ml-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
              {t('subscription.save20')}
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isPopular = plan.popular;
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                isPopular
                  ? 'border-blue-500 scale-105'
                  : isCurrentPlan
                  ? 'border-green-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {t('subscription.mostPopular')}
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {t('subscription.current')}
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${getPlanColor(plan.name)} text-white mb-4`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                      /{selectedInterval === 'monthly' ? t('subscription.month') : t('subscription.year')}
                    </span>
                  </div>
                  {selectedInterval === 'yearly' && (
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {t('subscription.yearlyDiscount', { amount: Math.round(plan.price * 0.2) })}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onSelectPlan?.(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : isPopular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  }`}
                >
                  {isCurrentPlan
                    ? t('subscription.currentPlan')
                    : t('subscription.selectPlan')
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Comparison */}
      <div className="mt-12 bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {t('subscription.compareFeatures')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('subscription.exclusiveContent')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('subscription.exclusiveContentDescription')}
            </p>
          </div>
          
          <div className="text-center">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('subscription.prioritySupport')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('subscription.prioritySupportDescription')}
            </p>
          </div>
          
          <div className="text-center">
            <Crown className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('subscription.premiumFeatures')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('subscription.premiumFeaturesDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};