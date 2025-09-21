import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  Wallet, 
  Plus, 
  Trash2, 
  Edit3, 
  Star, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentApi } from '../../lib/api/payment';

interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal' | 'wallet';
  last4?: string;
  brand?: string;
  email?: string;
  walletBalance?: number;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
  nickname?: string;
  createdAt: string;
}

interface WalletBalance {
  balance: number;
  currency: string;
  pendingBalance: number;
}

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMethodType, setAddMethodType] = useState<'stripe' | 'paypal'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    nickname: ''
  });
  
  const [paypalForm, setPaypalForm] = useState({
    email: '',
    nickname: ''
  });
  
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUpForm, setShowTopUpForm] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
    loadWalletBalance();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentApi.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      setError(t('payment.errorLoadingMethods'));
    } finally {
      setLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const balance = await paymentApi.getWalletBalance();
      setWalletBalance(balance);
    } catch (err) {
      console.error('Error loading wallet balance:', err);
    }
  };

  const handleAddStripeCard = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const method = await paymentApi.addStripeCard({
        number: cardForm.number.replace(/\s/g, ''),
        expiry: cardForm.expiry,
        cvc: cardForm.cvc,
        name: cardForm.name,
        nickname: cardForm.nickname
      });
      
      setPaymentMethods(prev => [...prev, method]);
      setCardForm({ number: '', expiry: '', cvc: '', name: '', nickname: '' });
      setShowAddForm(false);
      setSuccess(t('payment.cardAddedSuccessfully'));
    } catch (err: any) {
      setError(err.message || t('payment.errorAddingCard'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPayPal = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const method = await paymentApi.addPayPalAccount({
        email: paypalForm.email,
        nickname: paypalForm.nickname
      });
      
      setPaymentMethods(prev => [...prev, method]);
      setPaypalForm({ email: '', nickname: '' });
      setShowAddForm(false);
      setSuccess(t('payment.paypalAddedSuccessfully'));
    } catch (err: any) {
      setError(err.message || t('payment.errorAddingPaypal'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      setIsProcessing(true);
      await paymentApi.setDefaultPaymentMethod(methodId);
      
      setPaymentMethods(prev => prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      })));
      
      setSuccess(t('payment.defaultMethodUpdated'));
    } catch (err: any) {
      setError(err.message || t('payment.errorUpdatingDefault'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!confirm(t('payment.confirmDeleteMethod'))) {
      return;
    }
    
    try {
      setIsProcessing(true);
      await paymentApi.deletePaymentMethod(methodId);
      
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      setSuccess(t('payment.methodDeletedSuccessfully'));
    } catch (err: any) {
      setError(err.message || t('payment.errorDeletingMethod'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateNickname = async (methodId: string, nickname: string) => {
    try {
      setIsProcessing(true);
      await paymentApi.updatePaymentMethod(methodId, { nickname });
      
      setPaymentMethods(prev => prev.map(method => 
        method.id === methodId ? { ...method, nickname } : method
      ));
      
      setEditingMethod(null);
      setSuccess(t('payment.nicknameUpdated'));
    } catch (err: any) {
      setError(err.message || t('payment.errorUpdatingNickname'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTopUpWallet = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const amount = parseFloat(topUpAmount) * 100; // Convert to cents
      await paymentApi.topUpWallet(amount);
      
      await loadWalletBalance();
      setTopUpAmount('');
      setShowTopUpForm(false);
      setSuccess(t('payment.walletToppedUp'));
    } catch (err: any) {
      setError(err.message || t('payment.errorToppingUpWallet'));
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

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'stripe':
        return <CreditCard className="w-6 h-6 text-gray-600" />;
      case 'paypal':
        return <Wallet className="w-6 h-6 text-blue-600" />;
      case 'wallet':
        return <Wallet className="w-6 h-6 text-green-600" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-600" />;
    }
  };

  const getMethodDisplay = (method: PaymentMethod) => {
    if (method.type === 'stripe') {
      return method.nickname || `${method.brand?.toUpperCase()} •••• ${method.last4}`;
    } else if (method.type === 'paypal') {
      return method.nickname || `PayPal - ${method.email}`;
    } else {
      return method.nickname || t('payment.digitalWallet');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('payment.paymentMethods')}
        </h2>
        <p className="text-gray-600">
          {t('payment.managePaymentMethodsDescription')}
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-green-700">{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Wallet Balance */}
      {walletBalance && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('payment.digitalWallet')}</h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">
                  {showBalance 
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: walletBalance.currency
                      }).format(walletBalance.balance / 100)
                    : '••••••'
                  }
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:text-gray-200"
                >
                  {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {walletBalance.pendingBalance > 0 && (
                <p className="text-sm opacity-90">
                  {t('payment.pendingBalance')}: {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: walletBalance.currency
                  }).format(walletBalance.pendingBalance / 100)}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowTopUpForm(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              {t('payment.topUp')}
            </button>
          </div>
        </div>
      )}

      {/* Top Up Form */}
      {showTopUpForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('payment.topUpWallet')}</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('payment.amount')}
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowTopUpForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleTopUpWallet}
                disabled={isProcessing || !topUpAmount || parseFloat(topUpAmount) < 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {t('payment.topUp')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="space-y-4 mb-8">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                {getMethodIcon(method)}
                <div className="ml-4 flex-1">
                  {editingMethod === method.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        defaultValue={method.nickname || getMethodDisplay(method)}
                        onBlur={(e) => handleUpdateNickname(method.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateNickname(method.id, e.currentTarget.value);
                          }
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {getMethodDisplay(method)}
                        </h3>
                        {method.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Star className="w-3 h-3 mr-1" />
                            {t('payment.default')}
                          </span>
                        )}
                      </div>
                      {method.type === 'stripe' && method.expiryMonth && method.expiryYear && (
                        <p className="text-sm text-gray-500">
                          {t('payment.expires')} {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {t('payment.addedOn')} {new Date(method.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingMethod(editingMethod === method.id ? null : method.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={t('payment.editNickname')}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                    title={t('payment.setAsDefault')}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => handleDeleteMethod(method.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title={t('payment.deleteMethod')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Method */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('payment.addNewMethod')}
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('payment.addNewMethod')}</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setAddMethodType('stripe')}
              className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                addMethodType === 'stripe'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-5 h-5 mx-auto mb-1" />
              {t('payment.creditCard')}
            </button>
            <button
              onClick={() => setAddMethodType('paypal')}
              className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                addMethodType === 'paypal'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Wallet className="w-5 h-5 mx-auto mb-1" />
              PayPal
            </button>
          </div>
          
          {addMethodType === 'stripe' ? (
            <div className="space-y-4">
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
              
              <div className="grid grid-cols-2 gap-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.nickname')} ({t('common.optional')})
                </label>
                <input
                  type="text"
                  value={cardForm.nickname}
                  onChange={(e) => setCardForm(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder={t('payment.enterNickname')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleAddStripeCard}
                disabled={isProcessing || !cardForm.number || !cardForm.expiry || !cardForm.cvc || !cardForm.name}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                {t('payment.addCard')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.paypalEmail')}
                </label>
                <input
                  type="email"
                  value={paypalForm.email}
                  onChange={(e) => setPaypalForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.nickname')} ({t('common.optional')})
                </label>
                <input
                  type="text"
                  value={paypalForm.nickname}
                  onChange={(e) => setPaypalForm(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder={t('payment.enterNickname')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleAddPayPal}
                disabled={isProcessing || !paypalForm.email}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                {t('payment.addPaypal')}
              </button>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-2" />
            {t('payment.secureEncryption')}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;