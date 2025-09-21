import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Coins, Wallet, Shield, CheckCircle, AlertCircle, X } from 'lucide-react';
import { PaymentMethod, PaymentIntent, Transaction } from '../../types/marketplace';
import { paymentApi } from '../../lib/api/payment';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentSystemProps {
  amount: number;
  currency: 'USD' | 'coins';
  itemId: string;
  itemType: 'story' | 'subscription' | 'coins';
  itemName: string;
  onSuccess?: (transaction: Transaction) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

const PaymentSystem: React.FC<PaymentSystemProps> = ({
  amount,
  currency,
  itemId,
  itemType,
  itemName,
  onSuccess,
  onCancel,
  isOpen
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [userBalance, setUserBalance] = useState({ coins: 0, points: 0 });
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      loadUserBalance();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentApi.getPaymentMethods();
      setPaymentMethods(methods);
      
      // Set default payment method
      if (currency === 'coins' && userBalance.coins >= amount) {
        setSelectedMethod('coins');
      } else if (methods.length > 0) {
        setSelectedMethod(methods[0].id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError(t('payment.errorLoadingMethods'));
    } finally {
      setLoading(false);
    }
  };

  const loadUserBalance = async () => {
    try {
      const balance = await paymentApi.getUserBalance();
      setUserBalance(balance);
    } catch (error) {
      console.error('Error loading user balance:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod || !user) return;

    try {
      setProcessing(true);
      setError('');

      let paymentIntent: PaymentIntent;

      if (selectedMethod === 'coins') {
        // Pay with coins
        paymentIntent = await paymentApi.payWithCoins({
          itemId,
          itemType,
          amount,
          userId: user.id
        });
      } else if (selectedMethod === 'new_card') {
        // Pay with new card
        paymentIntent = await paymentApi.createPaymentIntent({
          amount: currency === 'USD' ? amount * 100 : amount, // Convert to cents for USD
          currency: currency === 'USD' ? 'usd' : 'coins',
          itemId,
          itemType,
          paymentMethod: {
            type: 'card',
            card: cardDetails
          }
        });
      } else {
        // Pay with saved payment method
        paymentIntent = await paymentApi.createPaymentIntent({
          amount: currency === 'USD' ? amount * 100 : amount,
          currency: currency === 'USD' ? 'usd' : 'coins',
          itemId,
          itemType,
          paymentMethodId: selectedMethod
        });
      }

      if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.(paymentIntent.transaction);
        }, 1500);
      } else {
        setError(t('payment.paymentFailed'));
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || t('payment.paymentError'));
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'coins':
        return <Coins className="w-5 h-5" />;
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'wallet':
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('payment.completePayment')}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Success State */}
          {success && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('payment.paymentSuccessful')}
              </h3>
              <p className="text-gray-600">
                {t('payment.paymentSuccessDescription')}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  {t('payment.paymentError')}
                </h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  {t('payment.orderSummary')}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">{itemName}</span>
                  <span className="font-medium">
                    {currency === 'USD' ? `$${amount}` : `${amount} ${t('payment.coins')}`}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between font-medium">
                    <span>{t('payment.total')}</span>
                    <span>
                      {currency === 'USD' ? `$${amount}` : `${amount} ${t('payment.coins')}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Balance */}
              {currency === 'coins' && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Coins className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">
                        {t('payment.yourBalance')}
                      </span>
                    </div>
                    <span className="font-bold text-blue-900">
                      {userBalance.coins} {t('payment.coins')}
                    </span>
                  </div>
                  {userBalance.coins < amount && (
                    <p className="text-sm text-blue-700 mt-2">
                      {t('payment.insufficientBalance')}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  {t('payment.paymentMethod')}
                </h3>

                <div className="space-y-3">
                  {/* Coins Payment (if applicable) */}
                  {currency === 'coins' && userBalance.coins >= amount && (
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="coins"
                        checked={selectedMethod === 'coins'}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center flex-1">
                        <Coins className="w-5 h-5 text-yellow-500 mr-3" />
                        <div>
                          <p className="font-medium">{t('payment.payWithCoins')}</p>
                          <p className="text-sm text-gray-600">
                            {t('payment.coinsBalance')}: {userBalance.coins}
                          </p>
                        </div>
                      </div>
                    </label>
                  )}

                  {/* Saved Payment Methods */}
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center flex-1">
                        {getPaymentMethodIcon(method.type)}
                        <div className="ml-3">
                          <p className="font-medium">
                            {method.type === 'card' ? `**** ${method.last4}` : method.name}
                          </p>
                          <p className="text-sm text-gray-600">{method.brand}</p>
                        </div>
                      </div>
                    </label>
                  ))}

                  {/* New Card Option */}
                  {currency === 'USD' && (
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="new_card"
                        checked={selectedMethod === 'new_card'}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center flex-1">
                        <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                        <p className="font-medium">{t('payment.newCard')}</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* New Card Form */}
              {selectedMethod === 'new_card' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">
                    {t('payment.cardDetails')}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('payment.cardNumber')}
                      </label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails(prev => ({
                          ...prev,
                          number: formatCardNumber(e.target.value)
                        }))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('payment.expiry')}
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails(prev => ({
                            ...prev,
                            expiry: formatExpiry(e.target.value)
                          }))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('payment.cvc')}
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails(prev => ({
                            ...prev,
                            cvc: e.target.value.replace(/\D/g, '').substring(0, 4)
                          }))}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('payment.cardholderName')}
                      </label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        placeholder={t('payment.cardholderNamePlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
                <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 mb-1">
                    {t('payment.securePayment')}
                  </p>
                  <p className="text-green-700">
                    {t('payment.securePaymentDescription')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || processing || loading}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('payment.processing')}
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      {t('payment.payNow')}
                    </>
                  )}
                </button>
                
                <button
                  onClick={onCancel}
                  disabled={processing}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSystem;