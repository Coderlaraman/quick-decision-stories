import { supabase } from '../supabase';
import {
  CommunityStory,
  StoryScene,
  StoryOption,
  UserCurrency,
  Achievement,
  UserAchievement,
  StoryPurchase,
  StoryReview,
  CreatorReputation,
  SubscriptionPlan,
  UserSubscription,
  PaginatedResponse,
  ApiResponse,
  StoryFilters,
  SearchParams
} from '../../types/community';

// =============================================
// COMMUNITY STORIES API
// =============================================

export const communityStoriesApi = {
  // Get paginated community stories
  async getStories(params: SearchParams = {}): Promise<PaginatedResponse<CommunityStory>> {
    const {
      query = '',
      filters = {},
      page = 1,
      per_page = 12
    } = params;

    let queryBuilder = supabase
      .from('community_stories')
      .select(`
        *,
        author:profiles!author_id(
          id,
          username,
          avatar_url
        ),
        reviews:story_reviews(
          rating
        )
      `, { count: 'exact' })
      .eq('is_published', true)
      .eq('moderation_status', 'approved');

    // Apply search query
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Apply filters
    if (filters.tags && filters.tags.length > 0) {
      queryBuilder = queryBuilder.overlaps('tags', filters.tags);
    }
    if (filters.author_id) {
      queryBuilder = queryBuilder.eq('author_id', filters.author_id);
    }
    if (filters.is_premium !== undefined) {
      queryBuilder = queryBuilder.eq('is_premium', filters.is_premium);
    }
    if (filters.max_price !== undefined) {
      queryBuilder = queryBuilder.lte('price', filters.max_price);
    }
    if (filters.estimated_time_range) {
      queryBuilder = queryBuilder
        .gte('estimated_time', filters.estimated_time_range[0])
        .lte('estimated_time', filters.estimated_time_range[1]);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    // Calculate average ratings
    const storiesWithRatings = data?.map(story => ({
      ...story,
      average_rating: story.reviews?.length > 0 
        ? story.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / story.reviews.length
        : 0,
      total_reviews: story.reviews?.length || 0
    })) || [];

    return {
      data: storiesWithRatings,
      count: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page)
    };
  },

  // Get single story with scenes and options
  async getStory(id: string): Promise<ApiResponse<CommunityStory>> {
    const { data, error } = await supabase
      .from('community_stories')
      .select(`
        *,
        author:profiles!author_id(
          id,
          username,
          avatar_url
        ),
        scenes:story_scenes(
          *,
          options:story_options(*)
        ),
        reviews:story_reviews(
          *,
          user:profiles!user_id(
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { error: error.message };
    }

    // Sort scenes and options by order_index
    if (data.scenes) {
      data.scenes.sort((a: any, b: any) => a.order_index - b.order_index);
      data.scenes.forEach((scene: any) => {
        if (scene.options) {
          scene.options.sort((a: any, b: any) => a.order_index - b.order_index);
        }
      });
    }

    return { data };
  },

  // Create new story
  async createStory(story: Partial<CommunityStory>): Promise<ApiResponse<CommunityStory>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('community_stories')
      .insert({
        ...story,
        author_id: user.id
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Update story
  async updateStory(id: string, updates: Partial<CommunityStory>): Promise<ApiResponse<CommunityStory>> {
    const { data, error } = await supabase
      .from('community_stories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Delete story
  async deleteStory(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('community_stories')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { message: 'Historia eliminada exitosamente' };
  },

  // Get user's stories
  async getUserStories(userId?: string): Promise<ApiResponse<CommunityStory[]>> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      return { error: 'Usuario no encontrado' };
    }

    const { data, error } = await supabase
      .from('community_stories')
      .select(`
        *,
        scenes:story_scenes(count),
        reviews:story_reviews(
          rating
        )
      `)
      .eq('author_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data: data || [] };
  }
};

// =============================================
// STORY SCENES AND OPTIONS API
// =============================================

export const storyEditorApi = {
  // Create scene
  async createScene(scene: Partial<StoryScene>): Promise<ApiResponse<StoryScene>> {
    const { data, error } = await supabase
      .from('story_scenes')
      .insert(scene)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Update scene
  async updateScene(id: string, updates: Partial<StoryScene>): Promise<ApiResponse<StoryScene>> {
    const { data, error } = await supabase
      .from('story_scenes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Delete scene
  async deleteScene(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('story_scenes')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { message: 'Escena eliminada exitosamente' };
  },

  // Create option
  async createOption(option: Partial<StoryOption>): Promise<ApiResponse<StoryOption>> {
    const { data, error } = await supabase
      .from('story_options')
      .insert(option)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Update option
  async updateOption(id: string, updates: Partial<StoryOption>): Promise<ApiResponse<StoryOption>> {
    const { data, error } = await supabase
      .from('story_options')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Delete option
  async deleteOption(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('story_options')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { message: 'Opción eliminada exitosamente' };
  }
};

// =============================================
// GAMIFICATION API
// =============================================

export const gamificationApi = {
  // Get user currency
  async getUserCurrency(): Promise<ApiResponse<UserCurrency>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('user_currency')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Update user currency
  async updateCurrency(updates: Partial<UserCurrency>): Promise<ApiResponse<UserCurrency>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('user_currency')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Get all achievements
  async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { data: data || [] };
  },

  // Get user achievements
  async getUserAchievements(): Promise<ApiResponse<UserAchievement[]>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data: data || [] };
  },

  // Award achievement to user
  async awardAchievement(achievementId: string): Promise<ApiResponse<UserAchievement>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievementId
      })
      .select(`
        *,
        achievement:achievements(*)
      `)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Get leaderboard
  async getLeaderboard(params: { type: string; limit?: number }): Promise<ApiResponse<any[]>> {
    const { type, limit = 10 } = params;
    
    // Mock leaderboard data for now
    const mockLeaderboard = Array.from({ length: limit }, (_, i) => ({
      user_id: `user-${i + 1}`,
      username: `Player${i + 1}`,
      level: Math.floor(Math.random() * 50) + 1,
      experience: Math.floor(Math.random() * 10000),
      points: Math.floor(Math.random() * 5000),
      coins: Math.floor(Math.random() * 1000)
    }));

    return {
      data: mockLeaderboard,
      success: true,
      message: 'Leaderboard loaded successfully'
    };
  }
};

// =============================================
// REVIEWS API
// =============================================

export const reviewsApi = {
  // Create review
  async createReview(review: Partial<StoryReview>): Promise<ApiResponse<StoryReview>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('story_reviews')
      .insert({
        ...review,
        user_id: user.id
      })
      .select(`
        *,
        user:profiles!user_id(
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Update review
  async updateReview(id: string, updates: Partial<StoryReview>): Promise<ApiResponse<StoryReview>> {
    const { data, error } = await supabase
      .from('story_reviews')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user:profiles!user_id(
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Delete review
  async deleteReview(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('story_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { message: 'Reseña eliminada exitosamente' };
  },

  // Get story reviews
  async getStoryReviews(storyId: string): Promise<ApiResponse<StoryReview[]>> {
    const { data, error } = await supabase
      .from('story_reviews')
      .select(`
        *,
        user:profiles!user_id(
          id,
          username,
          avatar_url
        )
      `)
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data: data || [] };
  }
};

// =============================================
// SUBSCRIPTION API
// =============================================

export const subscriptionApi = {
  // Get subscription plans
  async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { data: data || [] };
  },

  // Get user subscription
  async getUserSubscription(): Promise<ApiResponse<UserSubscription | null>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      return { error: error.message };
    }

    return { data: data || null };
  }
};

// =============================================
// CREATOR REPUTATION API
// =============================================

export const reputationApi = {
  // Get creator reputation
  async getCreatorReputation(creatorId: string): Promise<ApiResponse<CreatorReputation>> {
    const { data, error } = await supabase
      .from('creator_reputation')
      .select('*')
      .eq('creator_id', creatorId)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  },

  // Get top creators
  async getTopCreators(limit: number = 10): Promise<ApiResponse<(CreatorReputation & { creator: any })[]>> {
    const { data, error } = await supabase
      .from('creator_reputation')
      .select(`
        *,
        creator:profiles!creator_id(
          id,
          username,
          avatar_url
        )
      `)
      .order('reputation_score', { ascending: false })
      .limit(limit);

    if (error) {
      return { error: error.message };
    }

    return { data: data || [] };
  }
};

// Additional exports for compatibility
export const createCommunityStory = communityStoriesApi.createStory;
export const updateCommunityStory = communityStoriesApi.updateStory;
export const communityApi = {
  ...communityStoriesApi,
  ...gamificationApi,
  ...reviewsApi,
  ...subscriptionApi,
  ...reputationApi
};