import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Heart, Eye, Clock, Coins, Crown, Filter, Search, SortAsc } from 'lucide-react';
import { PremiumStory, MarketplaceFilters } from '../../types/marketplace';
import { marketplaceApi } from '../../lib/api/marketplace';
import { useAuth } from '../../contexts/AuthContext';

interface MarketplaceGridProps {
  onStorySelect?: (story: PremiumStory) => void;
  showFilters?: boolean;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({ 
  onStorySelect,
  showFilters = true 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stories, setStories] = useState<PremiumStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: '',
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    sortBy: 'popularity',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    loadStories();
  }, [filters, searchQuery]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await marketplaceApi.getStories({
        ...filters,
        search: searchQuery,
        limit: 20,
        offset: 0
      });
      setStories(response.data);
    } catch (error) {
      console.error('Error loading marketplace stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (storyId: string, price: number) => {
    if (!user) {
      // Redirect to login
      return;
    }

    try {
      await marketplaceApi.purchaseStory(storyId, {
        paymentMethod: 'coins',
        amount: price
      });
      
      // Update story status
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, isPurchased: true }
          : story
      ));
    } catch (error) {
      console.error('Error purchasing story:', error);
    }
  };

  const handleFavorite = async (storyId: string) => {
    if (!user) return;

    try {
      await marketplaceApi.toggleFavorite(storyId);
      
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, isFavorited: !story.isFavorited }
          : story
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getPriceDisplay = (story: PremiumStory) => {
    if (story.isPurchased) {
      return (
        <span className="text-green-600 font-medium">
          {t('marketplace.owned')}
        </span>
      );
    }
    
    if (story.price === 0) {
      return (
        <span className="text-blue-600 font-medium">
          {t('marketplace.free')}
        </span>
      );
    }
    
    return (
      <div className="flex items-center text-yellow-600 font-medium">
        <Coins className="w-4 h-4 mr-1" />
        {story.price}
      </div>
    );
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('marketplace.title')}
        </h1>
        <p className="text-gray-600">
          {t('marketplace.subtitle')}
        </p>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('marketplace.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('marketplace.filters')}
            </button>
            
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="popularity">{t('marketplace.sortBy.popularity')}</option>
              <option value="rating">{t('marketplace.sortBy.rating')}</option>
              <option value="price">{t('marketplace.sortBy.price')}</option>
              <option value="newest">{t('marketplace.sortBy.newest')}</option>
            </select>
            
            <button
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SortAsc className={`w-4 h-4 mr-2 ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              {filters.sortOrder === 'asc' ? t('marketplace.ascending') : t('marketplace.descending')}
            </button>
          </div>

          {/* Filters Panel */}
          {showFiltersPanel && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.category')}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('marketplace.allCategories')}</option>
                    <option value="adventure">{t('categories.adventure')}</option>
                    <option value="mystery">{t('categories.mystery')}</option>
                    <option value="romance">{t('categories.romance')}</option>
                    <option value="horror">{t('categories.horror')}</option>
                    <option value="scifi">{t('categories.scifi')}</option>
                    <option value="fantasy">{t('categories.fantasy')}</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.priceRange')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.minimumRating')}
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>{t('marketplace.anyRating')}</option>
                    <option value={1}>1+ {t('marketplace.stars')}</option>
                    <option value={2}>2+ {t('marketplace.stars')}</option>
                    <option value={3}>3+ {t('marketplace.stars')}</option>
                    <option value={4}>4+ {t('marketplace.stars')}</option>
                    <option value={5}>5 {t('marketplace.stars')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="text-center py-12">
          <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('marketplace.noStoriesFound')}
          </h3>
          <p className="text-gray-600">
            {t('marketplace.noStoriesDescription')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Story Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                {story.coverImage ? (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Crown className="w-12 h-12 text-white opacity-50" />
                  </div>
                )}
                
                {/* Premium Badge */}
                {story.isPremium && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      {t('marketplace.premium')}
                    </div>
                  </div>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={() => handleFavorite(story.id)}
                  className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <Heart className={`w-4 h-4 ${
                    story.isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'
                  }`} />
                </button>
              </div>

              {/* Story Content */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('marketplace.by')} {story.author.username}
                  </p>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {story.description}
                </p>
                
                {/* Rating and Stats */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {getRatingStars(story.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({story.reviewCount})
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    {story.views.toLocaleString()}
                  </div>
                </div>
                
                {/* Category and Duration */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {t(`categories.${story.category}`)}
                  </span>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {story.estimatedDuration}m
                  </div>
                </div>
                
                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  {getPriceDisplay(story)}
                  
                  {story.isPurchased ? (
                    <button
                      onClick={() => onStorySelect?.(story)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {t('marketplace.play')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(story.id, story.price)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {story.price === 0 ? t('marketplace.getFree') : t('marketplace.buy')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceGrid;