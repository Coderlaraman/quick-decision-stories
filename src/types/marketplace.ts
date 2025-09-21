export interface PremiumStory {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  price: number;
  currency: 'USD' | 'coins';
  rating: number;
  reviewCount: number;
  purchaseCount: number;
  thumbnail: string;
  screenshots: string[];
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  createdAt: string;
  updatedAt: string;
  isPurchased: boolean;
  isWishlisted: boolean;
  isFeatured: boolean;
  isNew: boolean;
  discount?: {
    percentage: number;
    originalPrice: number;
    validUntil: string;
  };
}

export interface MarketplaceStats {
  totalStories: number;
  totalAuthors: number;
  averageRating: number;
  totalSales: number;
  featuredStories: PremiumStory[];
  newReleases: PremiumStory[];
  topRated: PremiumStory[];
  bestSellers: PremiumStory[];
}

export interface MarketplaceFilters {
  category?: string;
  priceRange?: string;
  rating?: string;
  sortBy?: 'popular' | 'newest' | 'rating' | 'price_low' | 'price_high';
  purchased?: boolean;
}

export interface Purchase {
  id: string;
  storyId: string;
  userId: string;
  amount: number;
  currency: 'USD' | 'coins';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  purchasedAt: string;
  refundedAt?: string;
}

export interface Commission {
  id: string;
  authorId: string;
  storyId: string;
  storyTitle: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  currency: 'USD' | 'coins';
  status: 'pending' | 'paid' | 'disputed';
  saleDate: string;
  paidDate?: string;
}

export interface AuthorStats {
  totalStories: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  pendingCommissions: number;
  paidCommissions: number;
  topSellingStory: {
    id: string;
    title: string;
    sales: number;
    revenue: number;
  };
}