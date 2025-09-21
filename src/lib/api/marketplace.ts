import { PremiumStory, MarketplaceStats, MarketplaceFilters, Purchase, Commission, AuthorStats } from '../../types/marketplace';

// Mock data for premium stories
const mockStories: PremiumStory[] = [
  {
    id: '1',
    title: 'The Quantum Detective',
    description: 'A thrilling sci-fi mystery where you solve crimes across parallel dimensions.',
    author: 'Sarah Chen',
    authorId: 'author-1',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    category: 'Sci-Fi',
    tags: ['mystery', 'quantum', 'detective', 'parallel-worlds'],
    price: 299,
    currency: 'coins',
    rating: 4.8,
    reviewCount: 156,
    purchaseCount: 1240,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    screenshots: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'
    ],
    duration: 45,
    difficulty: 'medium',
    language: 'English',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    isPurchased: false,
    isWishlisted: true,
    isFeatured: true,
    isNew: false,
    discount: {
      percentage: 20,
      originalPrice: 399,
      validUntil: '2024-02-15T23:59:59Z'
    }
  },
  {
    id: '2',
    title: 'Medieval Kingdom Builder',
    description: 'Build and manage your own medieval kingdom in this strategic adventure.',
    author: 'Marcus Thompson',
    authorId: 'author-2',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    category: 'Strategy',
    tags: ['medieval', 'kingdom', 'strategy', 'management'],
    price: 4.99,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 89,
    purchaseCount: 567,
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    screenshots: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600'
    ],
    duration: 60,
    difficulty: 'hard',
    language: 'English',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    isPurchased: true,
    isWishlisted: false,
    isFeatured: false,
    isNew: true
  }
];

export const marketplaceApi = {
  // Get marketplace statistics
  getStats: async (): Promise<{ data: MarketplaceStats; success: boolean; message: string }> => {
    const stats: MarketplaceStats = {
      totalStories: 1250,
      totalAuthors: 340,
      averageRating: 4.3,
      totalSales: 15600,
      featuredStories: mockStories.filter(s => s.isFeatured),
      newReleases: mockStories.filter(s => s.isNew),
      topRated: mockStories.sort((a, b) => b.rating - a.rating).slice(0, 6),
      bestSellers: mockStories.sort((a, b) => b.purchaseCount - a.purchaseCount).slice(0, 6)
    };
    
    return {
      data: stats,
      success: true,
      message: 'Marketplace stats loaded successfully'
    };
  },

  // Search and filter stories
  searchStories: async (query: string, filters: MarketplaceFilters = {}): Promise<PremiumStory[]> => {
    let results = [...mockStories];

    // Apply search query
    if (query) {
      results = results.filter(story => 
        story.title.toLowerCase().includes(query.toLowerCase()) ||
        story.description.toLowerCase().includes(query.toLowerCase()) ||
        story.author.toLowerCase().includes(query.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      results = results.filter(story => story.category === filters.category);
    }

    if (filters.purchased !== undefined) {
      results = results.filter(story => story.isPurchased === filters.purchased);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
      default:
        results.sort((a, b) => b.purchaseCount - a.purchaseCount);
        break;
    }

    return results;
  },

  // Get story details
  getStory: async (storyId: string): Promise<PremiumStory | null> => {
    return mockStories.find(story => story.id === storyId) || null;
  },

  // Purchase a story
  purchaseStory: async (storyId: string, paymentMethod: string): Promise<Purchase> => {
    const story = mockStories.find(s => s.id === storyId);
    if (!story) throw new Error('Story not found');

    return {
      id: `purchase-${Date.now()}`,
      storyId,
      userId: 'current-user',
      amount: story.price,
      currency: story.currency,
      status: 'completed',
      paymentMethod,
      transactionId: `txn-${Date.now()}`,
      purchasedAt: new Date().toISOString()
    };
  },

  // Toggle wishlist
  toggleWishlist: async (storyId: string): Promise<{ isWishlisted: boolean }> => {
    const story = mockStories.find(s => s.id === storyId);
    if (story) {
      story.isWishlisted = !story.isWishlisted;
    }
    return { isWishlisted: story?.isWishlisted || false };
  },

  // Get user's purchases
  getUserPurchases: async (): Promise<Purchase[]> => {
    return [
      {
        id: 'purchase-1',
        storyId: '2',
        userId: 'current-user',
        amount: 4.99,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: 'txn-12345',
        purchasedAt: '2024-01-18T10:30:00Z'
      }
    ];
  },

  // Author dashboard methods
  getAuthorStats: async (authorId: string): Promise<AuthorStats> => {
    return {
      totalStories: 5,
      totalSales: 1807,
      totalRevenue: 2456.78,
      averageRating: 4.6,
      totalReviews: 245,
      pendingCommissions: 156.89,
      paidCommissions: 2299.89,
      topSellingStory: {
        id: '2',
        title: 'Medieval Kingdom Builder',
        sales: 567,
        revenue: 2834.33
      }
    };
  },

  // Get author's commissions
  getAuthorCommissions: async (authorId: string): Promise<Commission[]> => {
    return [
      {
        id: 'comm-1',
        authorId,
        storyId: '2',
        storyTitle: 'Medieval Kingdom Builder',
        saleAmount: 4.99,
        commissionRate: 0.7,
        commissionAmount: 3.49,
        currency: 'USD',
        status: 'paid',
        saleDate: '2024-01-18T10:30:00Z',
        paidDate: '2024-01-25T09:15:00Z'
      }
    ];
  }
};