import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Wallet, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentApi } from '../../lib/api/payment';

interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal';
  last4?: string;
  brand?: string;
  email?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

interface PaymentIntegrationProps {
  amount: number;
  currency: string;
  description: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  amount,
  currency,
  description,
  onSuccess,
  onError,
  onCancel
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [paypalEmail, setPaypalEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentApi.getPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) {
        const defaultMethod = methods.find(m => m.isDefault) || methods[0];
        setSelectedMethod(defaultMethod.id);
      }
    } catch (err) {
      setError(t('payment.errorLoadingMethods'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddStripeCard = async () => {
    try {
      setIsProcessing(true);
      const method = await paymentApi.addStripeCard({
        number: cardForm.number.replace(/\s/g, ''),
        expiry: cardForm.expiry,
        cvc: cardForm.cvc,
        name: cardForm.name
      });
      
      setPaymentMethods(prev => [...prev, method]);
      setSelectedMethod(method.id);
      setShowAddCard(false);
      setCardForm({ number: '', expiry: '', cvc: '', name: '' });
    } catch (err: any) {
      setError(err.message || t('payment.errorAddingCard'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPayPal = async () => {
    try {
      setIsProcessing(true);
      const method = await paymentApi.addPayPalAccount(paypalEmail);
      
      setPaymentMethods(prev => [...prev, method]);
      setSelectedMethod(method.id);
      setPaypalEmail('');
    } catch (err: any) {
      setError(err.message || t('payment.errorAddingPaypal'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError(t('payment.selectMethodFirst'));
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
      if (!selectedPaymentMethod) {
        throw new Error(t('payment.methodNotFound'));
      }

      let paymentResult;
      if (selectedPaymentMethod.type === 'stripe') {
        paymentResult = await paymentApi.processStripePayment({
          methodId: selectedMethod,
          amount,
          currency,
          description
        });
      } else {
        paymentResult = await paymentApi.processPayPalPayment({
          methodId: selectedMethod,
          amount,
          currency,
          description
        });
      }

      onSuccess(paymentResult.id);
    } catch (err: any) {
      const errorMessage = err.message || t('payment.processingError');
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t('payment.loadingMethods')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t('payment.completePayment')}
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">{t('payment.amount')}:</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
              }).format(amount / 100)}
            </span>
          </div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">
          {t('payment.selectMethod')}
        </h4>
        
        {paymentMethods.length > 0 && (
          <div className="space-y-2 mb-4">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center flex-1">
                  {method.type === 'stripe' ? (
                    <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                  ) : (
                    <Wallet className="w-5 h-5 text-blue-600 mr-3" />
                  )}
                  <div>
                    <div className="font-medium">
                      {method.type === 'stripe'
                        ? `${method.brand?.toUpperCase()} •••• ${method.last4}`
                        : `PayPal - ${method.email}`
                      }
                    </div>
                    {method.type === 'stripe' && method.expiryMonth && method.expiryYear && (
                      <div className="text-sm text-gray-500">
                        {t('payment.expires')} {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                      </div>
                    )}
                    {method.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {t('payment.default')}
                      </span>
                    )}
                  </div>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </label>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowAddCard(!showAddCard)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          + {t('payment.addNewMethod')}
        </button>
      </div>

      {showAddCard && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setShowAddCard(false)}
              className="flex-1 py-2 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {t('payment.addCard')}
            </button>
            <button
              onClick={() => setShowAddCard(false)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('payment.addPaypal')}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('payment.cardNumber')}
              </label>
              <input
                type="text"
                value={cardForm.number}
                onChange={(e) => setCardForm(prev => ({
                  ...prev,
                  number: formatCardNumber(e.target.value)
                }))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.expiry')}
                </label>
                <input
                  type="text"
                  value={cardForm.expiry}
                  onChange={(e) => setCardForm(prev => ({
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
                  value={cardForm.cvc}
                  onChange={(e) => setCardForm(prev => ({
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
                value={cardForm.name}
                onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('payment.enterName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleAddStripeCard}
              disabled={isProcessing || !cardForm.number || !cardForm.expiry || !cardForm.cvc || !cardForm.name}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              {t('payment.addCard')}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center mb-4">
        <Shield className="w-5 h-5 text-green-600 mr-2" />
        <span className="text-sm text-gray-600">
          {t('payment.securePayment')}
        </span>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handlePayment}
          disabled={isProcessing || !selectedMethod}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="w-4 h-4 mr-2" />
          )}
          {t('payment.payNow')}
        </button>
      </div>
    </div>
  );
};

export default PaymentIntegration;