import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, Calendar, Download, Eye, Users, Coins, CreditCard, BarChart3, PieChart } from 'lucide-react';
import { CommissionData, EarningsReport, PayoutRequest } from '../../types/marketplace';
import { commissionApi } from '../../lib/api/commission';
import { useAuth } from '../../contexts/AuthContext';

interface CommissionSystemProps {
  authorId?: string;
}

const CommissionSystem: React.FC<CommissionSystemProps> = ({ authorId }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [earningsReport, setEarningsReport] = useState<EarningsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'payouts' | 'analytics'>('overview');
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const currentAuthorId = authorId || user?.id;

  useEffect(() => {
    if (currentAuthorId) {
      loadCommissionData();
      loadEarningsReport();
      loadPayoutRequests();
    }
  }, [currentAuthorId, dateRange]);

  const loadCommissionData = async () => {
    try {
      setLoading(true);
      const data = await commissionApi.getCommissionData(currentAuthorId!, {
        period: dateRange
      });
      setCommissionData(data);
    } catch (error) {
      console.error('Error loading commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEarningsReport = async () => {
    try {
      const report = await commissionApi.getEarningsReport(currentAuthorId!, {
        period: dateRange,
        includeBreakdown: true
      });
      setEarningsReport(report);
    } catch (error) {
      console.error('Error loading earnings report:', error);
    }
  };

  const loadPayoutRequests = async () => {
    try {
      const requests = await commissionApi.getPayoutRequests(currentAuthorId!);
      setPayoutRequests(requests);
    } catch (error) {
      console.error('Error loading payout requests:', error);
    }
  };

  const handlePayoutRequest = async () => {
    if (!payoutAmount || !currentAuthorId) return;

    try {
      setRequestingPayout(true);
      const request = await commissionApi.requestPayout(currentAuthorId, {
        amount: parseFloat(payoutAmount),
        currency: 'USD'
      });
      
      setPayoutRequests(prev => [request, ...prev]);
      setPayoutAmount('');
      await loadCommissionData(); // Refresh data
    } catch (error) {
      console.error('Error requesting payout:', error);
    } finally {
      setRequestingPayout(false);
    }
  };

  const downloadEarningsReport = async () => {
    try {
      const reportData = await commissionApi.downloadEarningsReport(currentAuthorId!, {
        period: dateRange,
        format: 'pdf'
      });
      
      // Create download link
      const blob = new Blob([reportData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `earnings-report-${dateRange}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  if (!commissionData) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('commission.noData')}
        </h3>
        <p className="text-gray-600">
          {t('commission.noDataDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('commission.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('commission.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">{t('commission.lastWeek')}</option>
            <option value="month">{t('commission.lastMonth')}</option>
            <option value="quarter">{t('commission.lastQuarter')}</option>
            <option value="year">{t('commission.lastYear')}</option>
          </select>
          
          <button
            onClick={downloadEarningsReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('commission.downloadReport')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('commission.totalEarnings')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(commissionData.totalEarnings)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">
              +{commissionData.growthPercentage}%
            </span>
            <span className="text-sm text-gray-600 ml-2">
              {t('commission.fromLastPeriod')}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('commission.availableBalance')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(commissionData.availableBalance)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Coins className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {t('commission.minimumPayout')}: {formatCurrency(commissionData.minimumPayout)}
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('commission.totalSales')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {commissionData.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {t('commission.averagePrice')}: {formatCurrency(commissionData.averagePrice)}
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('commission.commissionRate')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {commissionData.commissionRate}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {t('commission.nextTier')}: {commissionData.nextTierRate}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: t('commission.overview'), icon: BarChart3 },
            { id: 'earnings', label: t('commission.earnings'), icon: DollarSign },
            { id: 'payouts', label: t('commission.payouts'), icon: CreditCard },
            { id: 'analytics', label: t('commission.analytics'), icon: PieChart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('commission.recentSales')}
            </h3>
            <div className="space-y-4">
              {commissionData.recentSales?.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{sale.storyTitle}</p>
                    <p className="text-sm text-gray-600">{formatDate(sale.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(sale.commission)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(sale.price)} × {sale.commissionRate}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Stories */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('commission.topStories')}
            </h3>
            <div className="space-y-4">
              {commissionData.topStories?.map((story, index) => (
                <div key={story.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{story.title}</p>
                      <p className="text-sm text-gray-600">
                        {story.sales} {t('commission.sales')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(story.earnings)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(story.averagePrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'earnings' && earningsReport && (
        <div className="space-y-6">
          {/* Earnings Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('commission.earningsChart')}
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <BarChart3 className="w-12 h-12 mr-4" />
              <p>{t('commission.chartPlaceholder')}</p>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('commission.earningsBreakdown')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsReport.storyEarnings)}
                </p>
                <p className="text-sm text-gray-600">{t('commission.storyEarnings')}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsReport.subscriptionEarnings)}
                </p>
                <p className="text-sm text-gray-600">{t('commission.subscriptionEarnings')}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsReport.bonusEarnings)}
                </p>
                <p className="text-sm text-gray-600">{t('commission.bonusEarnings')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-6">
          {/* Request Payout */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('commission.requestPayout')}
            </h3>
            
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('commission.payoutAmount')}
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  min={commissionData.minimumPayout}
                  max={commissionData.availableBalance}
                  step="0.01"
                  placeholder={`Min: ${formatCurrency(commissionData.minimumPayout)}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handlePayoutRequest}
                disabled={requestingPayout || !payoutAmount || parseFloat(payoutAmount) < commissionData.minimumPayout}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {requestingPayout ? t('common.processing') : t('commission.requestPayout')}
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              {t('commission.availableBalance')}: {formatCurrency(commissionData.availableBalance)}
            </p>
          </div>

          {/* Payout History */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('commission.payoutHistory')}
            </h3>
            
            {payoutRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{t('commission.noPayouts')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payoutRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(request.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('commission.requested')} {formatDate(request.requestedAt)}
                      </p>
                      {request.processedAt && (
                        <p className="text-sm text-gray-600">
                          {t('commission.processed')} {formatDate(request.processedAt)}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        getStatusColor(request.status)
                      }`}>
                        {t(`commission.status.${request.status}`)}
                      </span>
                      {request.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          {request.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('commission.salesAnalytics')}
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <PieChart className="w-12 h-12 mr-4" />
              <p>{t('commission.analyticsPlaceholder')}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('commission.performanceMetrics')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('commission.conversionRate')}</span>
                <span className="font-medium">{commissionData.conversionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('commission.averageRating')}</span>
                <span className="font-medium">{commissionData.averageRating}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('commission.repeatCustomers')}</span>
                <span className="font-medium">{commissionData.repeatCustomers}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('commission.refundRate')}</span>
                <span className="font-medium">{commissionData.refundRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionSystem;