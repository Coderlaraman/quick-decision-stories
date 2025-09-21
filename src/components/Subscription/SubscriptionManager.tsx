import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CreditCard, AlertCircle, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionApi } from '../../lib/api/subscriptionApi';

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  price: number;
  interval: 'monthly' | 'yearly';
}

interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  downloadUrl?: string;
}

export const SubscriptionManager: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subResponse, paymentResponse, invoiceResponse] = await Promise.all([
        subscriptionApi.getCurrentSubscription(),
        subscriptionApi.getPaymentMethods(),
        subscriptionApi.getInvoices()
      ]);
      
      setSubscription(subResponse.data);
      setPaymentMethods(paymentResponse.data || []);
      setInvoices(invoiceResponse.data || []);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setActionLoading('cancel');
      await subscriptionApi.cancelSubscription(subscription.id);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    
    try {
      setActionLoading('reactivate');
      await subscriptionApi.reactivateSubscription(subscription.id);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setActionLoading('payment');
      // Redirect to payment method update flow
      window.location.href = '/subscription/payment-methods';
    } catch (error) {
      console.error('Error updating payment method:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'past_due':
      case 'unpaid':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'canceled':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'past_due':
      case 'unpaid':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('subscription.noActiveSubscription')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('subscription.noActiveSubscriptionDescription')}
        </p>
        <button
          onClick={() => window.location.href = '/subscription/plans'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('subscription.browsePlans')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Current Subscription */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('subscription.currentSubscription')}
          </h2>
          <div className="flex items-center space-x-2">
            {getStatusIcon(subscription.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {t(`subscription.status.${subscription.status}`)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {subscription.planName}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('subscription.price')}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${subscription.price}/{subscription.interval === 'monthly' ? t('subscription.month') : t('subscription.year')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('subscription.billingPeriod')}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('subscription.nextBilling')}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading === 'cancel'}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'cancel' ? (
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  t('subscription.cancelSubscription')
                )}
              </button>
            )}

            {subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleReactivateSubscription}
                disabled={actionLoading === 'reactivate'}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'reactivate' ? (
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  t('subscription.reactivateSubscription')
                )}
              </button>
            )}

            <button
              onClick={handleUpdatePaymentMethod}
              disabled={actionLoading === 'payment'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === 'payment' ? (
                <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                t('subscription.updatePaymentMethod')
              )}
            </button>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                {t('subscription.cancelationNotice', { date: new Date(subscription.currentPeriodEnd).toLocaleDateString() })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('subscription.paymentMethods')}
          </h3>
          <button
            onClick={() => window.location.href = '/subscription/add-payment-method'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {t('subscription.addPaymentMethod')}
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('subscription.noPaymentMethods')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {method.card.brand.toUpperCase()} •••• {method.card.last4}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('subscription.expires')} {method.card.expMonth}/{method.card.expYear}
                    </div>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                    {t('subscription.default')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('subscription.billingHistory')}
        </h3>

        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('subscription.noBillingHistory')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t('subscription.date')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t('subscription.amount')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t('subscription.status')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t('subscription.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      ${invoice.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {t(`subscription.invoiceStatus.${invoice.status}`)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {invoice.downloadUrl && (
                        <button
                          onClick={() => window.open(invoice.downloadUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};