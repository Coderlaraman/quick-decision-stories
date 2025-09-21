// Community platform types
export interface CommunityStory {
  id: string;
  title: string;
  description: string;
  author_id: string;
  author?: UserProfile;
  image_url?: string;
  estimated_time: number;
  tags: string[];
  is_published: boolean;
  is_premium: boolean;
  price: number;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderation_notes?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  scenes?: StoryScene[];
  average_rating?: number;
  total_reviews?: number;
  total_purchases?: number;
}

export interface StoryScene {
  id: string;
  story_id: string;
  scene_id: string;
  title: string;
  content: string;
  image_url?: string;
  is_ending: boolean;
  ending_type?: 'happy' | 'neutral' | 'tragic' | 'mysterious';
  order_index: number;
  created_at: string;
  options?: StoryOption[];
}

export interface StoryOption {
  id: string;
  scene_id: string;
  option_id: string;
  text: string;
  next_scene_id?: string;
  is_default: boolean;
  order_index: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  reputation?: CreatorReputation;
}

// Gamification types
export interface UserCurrency {
  id: string;
  user_id: string;
  coins: number;
  gems: number;
  experience_points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_reward: number;
  coins_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement?: Achievement;
  earned_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  user?: UserProfile;
  category: string;
  score: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  period_start: string;
  updated_at: string;
  rank?: number;
}

// Marketplace types
export interface StoryPurchase {
  id: string;
  user_id: string;
  story_id: string;
  story?: CommunityStory;
  purchase_price: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  purchased_at: string;
}

export interface CreatorEarnings {
  id: string;
  creator_id: string;
  story_id: string;
  purchase_id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  payout_status: 'pending' | 'paid' | 'failed';
  payout_date?: string;
  created_at: string;
}

// Subscription types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  features: Record<string, any>;
  is_active: boolean;
  stripe_price_id?: string;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: SubscriptionPlan;
  stripe_subscription_id?: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Review and reputation types
export interface StoryReview {
  id: string;
  user_id: string;
  user?: UserProfile;
  story_id: string;
  rating: number;
  review_text?: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatorReputation {
  id: string;
  creator_id: string;
  total_stories: number;
  total_sales: number;
  average_rating: number;
  total_reviews: number;
  reputation_score: number;
  badges: string[];
  updated_at: string;
}

// Moderation types
export interface ContentReport {
  id: string;
  reporter_id: string;
  reporter?: UserProfile;
  content_type: 'story' | 'review' | 'profile';
  content_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderator_id?: string;
  moderator?: UserProfile;
  moderator_notes?: string;
  created_at: string;
  resolved_at?: string;
}

// Editor types for drag-and-drop story creation
export interface StoryEditorNode {
  id: string;
  type: 'scene' | 'option' | 'ending';
  position: { x: number; y: number };
  data: {
    title?: string;
    content?: string;
    image_url?: string;
    ending_type?: 'happy' | 'neutral' | 'tragic' | 'mysterious';
    option_text?: string;
    is_default?: boolean;
  };
  connections?: string[]; // IDs of connected nodes
}

export interface StoryEditorState {
  nodes: StoryEditorNode[];
  selectedNode?: string;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Search and filter types
export interface StoryFilters {
  tags?: string[];
  author_id?: string;
  is_premium?: boolean;
  min_rating?: number;
  max_price?: number;
  estimated_time_range?: [number, number];
  sort_by?: 'created_at' | 'updated_at' | 'rating' | 'price' | 'popularity';
  sort_order?: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: StoryFilters;
  page?: number;
  per_page?: number;
}

// Payment types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

// Analytics types
export interface StoryAnalytics {
  story_id: string;
  views: number;
  completions: number;
  completion_rate: number;
  average_completion_time: number;
  popular_choices: Array<{
    option_id: string;
    option_text: string;
    selection_count: number;
    selection_percentage: number;
  }>;
  ending_distribution: Array<{
    ending_id: string;
    ending_type: string;
    reach_count: number;
    reach_percentage: number;
  }>;
}

export interface UserAnalytics {
  user_id: string;
  total_stories_created: number;
  total_stories_completed: number;
  total_play_time: number;
  favorite_genres: string[];
  completion_streak: number;
  achievements_earned: number;
  level_progression: Array<{
    level: number;
    reached_at: string;
  }>;
}

export interface UserStats {
  user_id: string;
  username?: string;
  totalStories: number;
  totalCompletions: number;
  totalPlayTime: number;
  currentStreak: number;
  longestStreak: number;
  favoriteGenres: string[];
  achievementsEarned: number;
  level: number;
  experiencePoints: number;
  experience: number;
  coins: number;
  gems: number;
  reputation: number;
  points: number;
  rank: number;
  badges: string[];
}