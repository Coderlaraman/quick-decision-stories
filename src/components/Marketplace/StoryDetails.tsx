import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Heart, Eye, Clock, Coins, Crown, User, Calendar, MessageCircle, Share2, Play, ArrowLeft } from 'lucide-react';
import { PremiumStory, StoryReview } from '../../types/marketplace';
import { marketplaceApi } from '../../lib/api/marketplace';
import { useAuth } from '../../contexts/AuthContext';

interface StoryDetailsProps {
  storyId: string;
  onBack?: () => void;
  onPurchase?: (storyId: string) => void;
  onPlay?: (story: PremiumStory) => void;
}

const StoryDetails: React.FC<StoryDetailsProps> = ({ 
  storyId, 
  onBack, 
  onPurchase, 
  onPlay 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [story, setStory] = useState<PremiumStory | null>(null);
  const [reviews, setReviews] = useState<StoryReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadStoryDetails();
    loadReviews();
  }, [storyId]);

  const loadStoryDetails = async () => {
    try {
      setLoading(true);
      const response = await marketplaceApi.getStoryDetails(storyId);
      setStory(response);
    } catch (error) {
      console.error('Error loading story details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await marketplaceApi.getStoryReviews(storyId, {
        limit: 10,
        offset: 0
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!story || !user) return;

    try {
      setPurchasing(true);
      await marketplaceApi.purchaseStory(story.id, {
        paymentMethod: 'coins',
        amount: story.price
      });
      
      setStory(prev => prev ? { ...prev, isPurchased: true } : null);
      onPurchase?.(story.id);
    } catch (error) {
      console.error('Error purchasing story:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleFavorite = async () => {
    if (!story || !user) return;

    try {
      await marketplaceApi.toggleFavorite(story.id);
      setStory(prev => prev ? { ...prev, isFavorited: !prev.isFavorited } : null);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!story || !user || !newReview.comment.trim()) return;

    try {
      const review = await marketplaceApi.submitReview(story.id, {
        rating: newReview.rating,
        comment: newReview.comment.trim()
      });
      
      setReviews(prev => [review, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      
      // Update story rating
      await loadStoryDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getRatingStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive && onRatingChange ? () => onRatingChange(i + 1) : undefined}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (!story) {
    return (
      <div className="text-center py-12">
        <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('marketplace.storyNotFound')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('marketplace.storyNotFoundDescription')}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('common.back')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </button>
      )}

      {/* Story Header */}
      <div className="bg-white rounded-lg border overflow-hidden mb-6">
        <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
          {story.coverImage ? (
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Crown className="w-16 h-16 text-white opacity-50" />
            </div>
          )}
          
          {/* Premium Badge */}
          {story.isPremium && (
            <div className="absolute top-4 left-4">
              <div className="bg-yellow-500 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center">
                <Crown className="w-4 h-4 mr-2" />
                {t('marketplace.premium')}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {story.title}
              </h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <User className="w-4 h-4 mr-2" />
                <span>{t('marketplace.by')} {story.author.username}</span>
                <span className="mx-2">•</span>
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(story.createdAt)}</span>
              </div>
              
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center">
                  {getRatingStars(story.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {story.rating.toFixed(1)} ({story.reviewCount} {t('marketplace.reviews')})
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Eye className="w-4 h-4 mr-1" />
                  {story.views.toLocaleString()} {t('marketplace.views')}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {story.estimatedDuration}m
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {t(`categories.${story.category}`)}
                </span>
                
                {story.tags?.map((tag) => (
                  <span key={tag} className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 ml-6">
              {story.isPurchased ? (
                <button
                  onClick={() => onPlay?.(story)}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t('marketplace.play')}
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {purchasing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : story.price === 0 ? (
                    <span>{t('marketplace.getFree')}</span>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      {t('marketplace.buy')} ({story.price})
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={handleFavorite}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart className={`w-4 h-4 mr-2 ${
                  story.isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'
                }`} />
                {story.isFavorited ? t('marketplace.favorited') : t('marketplace.favorite')}
              </button>
              
              <button className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                {t('marketplace.share')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Description */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('marketplace.description')}
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {story.description}
        </p>
        
        {story.longDescription && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-700 leading-relaxed">
              {story.longDescription}
            </p>
          </div>
        )}
      </div>

      {/* Author Info */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('marketplace.aboutAuthor')}
        </h2>
        <div className="flex items-start">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
            {story.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{story.author.username}</h3>
            <p className="text-gray-600 text-sm mb-2">
              {story.author.storiesCount} {t('marketplace.storiesPublished')}
            </p>
            {story.author.bio && (
              <p className="text-gray-700">{story.author.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('marketplace.reviews')} ({story.reviewCount})
          </h2>
          
          {user && story.isPurchased && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('marketplace.writeReview')}
            </button>
          )}
        </div>
        
        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">
              {t('marketplace.writeReview')}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('marketplace.rating')}
              </label>
              <div className="flex items-center">
                {getRatingStars(newReview.rating, true, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('marketplace.comment')}
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('marketplace.commentPlaceholder')}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSubmitReview}
                disabled={!newReview.comment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {t('marketplace.submitReview')}
              </button>
              
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
        
        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t('marketplace.noReviews')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {review.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.user.username}</p>
                      <div className="flex items-center">
                        {getRatingStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  
                  <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                
                <p className="text-gray-700 ml-11">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDetails;