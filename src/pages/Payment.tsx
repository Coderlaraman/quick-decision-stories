import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  History, 
  Settings, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { paymentApi } from '../lib/api/payment';
import PaymentIntegration from '../components/Payment/PaymentIntegration';
import TransactionHistory from '../components/Payment/TransactionHistory';
import PaymentMethods from '../components/Payment/PaymentMethods';

interface PaymentStats {
  totalTransactions: number;
  totalVolume: number;
  averageTransaction: number;
  successRate: number;
  monthlyGrowth: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

const Payment: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'methods' | 'history' | 'integration'>('overview');
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    currency: 'USD',
    description: ''
  });

  useEffect(() => {
    loadPaymentStats();
  }, []);

  const loadPaymentStats = async () => {
    try {
      setLoading(true);
      const statsData = await paymentApi.getPaymentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading payment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-funds',
      title: t('payment.addFunds'),
      description: t('payment.addFundsDescription'),
      icon: <Wallet className="w-6 h-6" />,
      action: () => {
        setPaymentData({
          amount: 2000, // $20.00
          currency: 'USD',
          description: t('payment.walletTopUp')
        });
        setShowPaymentModal(true);
      },
      color: 'bg-green-500'
    },
    {
      id: 'buy-story',
      title: t('payment.buyPremiumStory'),
      description: t('payment.buyPremiumStoryDescription'),
      icon: <CreditCard className="w-6 h-6" />,
      action: () => {
        setPaymentData({
          amount: 299, // $2.99
          currency: 'USD',
          description: t('payment.premiumStoryPurchase')
        });
        setShowPaymentModal(true);
      },
      color: 'bg-blue-500'
    },
    {
      id: 'subscription',
      title: t('payment.upgradeSubscription'),
      description: t('payment.upgradeSubscriptionDescription'),
      icon: <TrendingUp className="w-6 h-6" />,
      action: () => {
        setPaymentData({
          amount: 999, // $9.99
          currency: 'USD',
          description: t('payment.monthlySubscription')
        });
        setShowPaymentModal(true);
      },
      color: 'bg-purple-500'
    },
    {
      id: 'gift-coins',
      title: t('payment.giftCoins'),
      description: t('payment.giftCoinsDescription'),
      icon: <Users className="w-6 h-6" />,
      action: () => {
        setPaymentData({
          amount: 500, // $5.00
          currency: 'USD',
          description: t('payment.giftCoinsTransaction')
        });
        setShowPaymentModal(true);
      },
      color: 'bg-pink-500'
    }
  ];

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    // Refresh stats and show success message
    loadPaymentStats();
    // You could also show a success toast here
  };

  const handlePaymentError = (error: string) => {
    // Handle payment error
    console.error('Payment error:', error);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('payment.totalTransactions')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('payment.totalVolume')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(stats.totalVolume / 100)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('payment.averageTransaction')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(stats.averageTransaction / 100)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('payment.successRate')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payment.quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg text-white mb-4 ${action.color}`}>
                {action.icon}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('payment.recentActivity')}</h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('payment.viewAll')}
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Sample recent transactions - in real app, this would come from API */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <ArrowDownLeft className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('payment.walletTopUp')}</p>
                  <p className="text-sm text-gray-500">{t('payment.today')}</p>
                </div>
              </div>
              <span className="font-semibold text-green-600">+$20.00</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <ArrowUpRight className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('payment.premiumStoryPurchase')}</p>
                  <p className="text-sm text-gray-500">{t('payment.yesterday')}</p>
                </div>
              </div>
              <span className="font-semibold text-red-600">-$2.99</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('payment.monthlySubscription')}</p>
                  <p className="text-sm text-gray-500">{t('payment.thisWeek')}</p>
                </div>
              </div>
              <span className="font-semibold text-red-600">-$9.99</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">{t('payment.securityNotice')}</h4>
            <p className="text-blue-800 text-sm">
              {t('payment.securityNoticeDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('payment.paymentCenter')}
          </h1>
          <p className="text-gray-600">
            {t('payment.paymentCenterDescription')}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('payment.overview')}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('methods')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'methods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                {t('payment.paymentMethods')}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <History className="w-4 h-4 mr-2" />
                {t('payment.transactionHistory')}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('integration')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'integration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                {t('payment.integration')}
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'methods' && <PaymentMethods />}
          {activeTab === 'history' && <TransactionHistory />}
          {activeTab === 'integration' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t('payment.testPaymentIntegration')}</h3>
              <p className="text-gray-600 mb-6">
                {t('payment.testPaymentIntegrationDescription')}
              </p>
              <button
                onClick={() => {
                  setPaymentData({
                    amount: 100, // $1.00
                    currency: 'USD',
                    description: t('payment.testTransaction')
                  });
                  setShowPaymentModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('payment.testPayment')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <PaymentIntegration
              amount={paymentData.amount}
              currency={paymentData.currency}
              description={paymentData.description}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;