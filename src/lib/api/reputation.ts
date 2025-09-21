import { supabase } from '../supabase';

export interface UserReputation {
  id: string;
  userId: string;
  username: string;
  totalPoints: number;
  level: number;
  levelName: string;
  badges: Badge[];
  achievements: Achievement[];
  rank: number;
  percentile: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  category: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedAt?: string;
  category: string;
}

export interface ReputationActivity {
  id: string;
  userId: string;
  action: string;
  points: number;
  description: string;
  createdAt: string;
  relatedId?: string;
  relatedType?: 'story' | 'comment' | 'review' | 'commission';
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  totalPoints: number;
  level: number;
  levelName: string;
  rank: number;
  badgeCount: number;
  achievementCount: number;
}

class ReputationApiService {
  async getUserReputation(userId: string): Promise<UserReputation | null> {
    try {
      const { data, error } = await supabase
        .from('user_reputation')
        .select(`
          *,
          users(username),
          user_badges(
            badges(*)
          ),
          user_achievements(
            achievements(*)
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        username: data.users?.username || 'Unknown User',
        totalPoints: data.total_points,
        level: data.level,
        levelName: data.level_name,
        badges: data.user_badges?.map((ub: any) => ({
          id: ub.badges.id,
          name: ub.badges.name,
          description: ub.badges.description,
          icon: ub.badges.icon,
          rarity: ub.badges.rarity,
          earnedAt: ub.earned_at,
          category: ub.badges.category
        })) || [],
        achievements: data.user_achievements?.map((ua: any) => ({
          id: ua.achievements.id,
          name: ua.achievements.name,
          description: ua.achievements.description,
          icon: ua.achievements.icon,
          points: ua.achievements.points,
          progress: ua.progress,
          maxProgress: ua.achievements.max_progress,
          completed: ua.completed,
          completedAt: ua.completed_at,
          category: ua.achievements.category
        })) || [],
        rank: data.rank || 0,
        percentile: data.percentile || 0
      };
    } catch (error) {
      console.error('Error fetching user reputation:', error);
      return null;
    }
  }

  async getLeaderboard(limit: number = 50, timeframe: 'all' | 'month' | 'week' = 'all'): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('user_reputation')
        .select(`
          user_id,
          total_points,
          level,
          level_name,
          rank,
          users(username, avatar),
          user_badges(count),
          user_achievements(count)
        `)
        .order('total_points', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return data?.map((entry, index) => ({
        userId: entry.user_id,
        username: entry.users?.username || 'Unknown User',
        avatar: entry.users?.avatar,
        totalPoints: entry.total_points,
        level: entry.level,
        levelName: entry.level_name,
        rank: index + 1,
        badgeCount: entry.user_badges?.length || 0,
        achievementCount: entry.user_achievements?.length || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async getReputationActivity(userId: string, limit: number = 20): Promise<ReputationActivity[]> {
    try {
      const { data, error } = await supabase
        .from('reputation_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching reputation activity:', error);
        return [];
      }

      return data?.map(activity => ({
        id: activity.id,
        userId: activity.user_id,
        action: activity.action,
        points: activity.points,
        description: activity.description,
        createdAt: activity.created_at,
        relatedId: activity.related_id,
        relatedType: activity.related_type
      })) || [];
    } catch (error) {
      console.error('Error fetching reputation activity:', error);
      return [];
    }
  }

  async addReputationPoints(userId: string, points: number, action: string, description: string, relatedId?: string, relatedType?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Add activity record
      const { error: activityError } = await supabase
        .from('reputation_activities')
        .insert({
          user_id: userId,
          action,
          points,
          description,
          related_id: relatedId,
          related_type: relatedType,
          created_at: new Date().toISOString()
        });

      if (activityError) {
        return { success: false, error: activityError.message };
      }

      // Update user reputation
      const { data: currentRep } = await supabase
        .from('user_reputation')
        .select('total_points, level')
        .eq('user_id', userId)
        .single();

      const newTotalPoints = (currentRep?.total_points || 0) + points;
      const newLevel = Math.floor(newTotalPoints / 100) + 1; // Simple level calculation
      const levelName = this.getLevelName(newLevel);

      const { error: updateError } = await supabase
        .from('user_reputation')
        .upsert({
          user_id: userId,
          total_points: newTotalPoints,
          level: newLevel,
          level_name: levelName,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Check for new achievements
      await this.checkAchievements(userId, newTotalPoints, newLevel);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to add reputation points' };
    }
  }

  async getBadges(): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('rarity', { ascending: true });

      if (error) {
        console.error('Error fetching badges:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
  }

  async getAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      return data?.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        points: achievement.points,
        progress: 0,
        maxProgress: achievement.max_progress,
        completed: false,
        category: achievement.category
      })) || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // The following mock methods provide data required by the Reputation pages/components.
  // They can later be replaced with real Supabase queries without changing callers.
  async getUserStats(userId: string): Promise<{
    totalRatings: number;
    averageRating: number;
    totalComments: number;
    totalLikes: number;
    reputationScore: number;
    level: string;
    badges: string[];
    rank: number;
    totalUsers: number;
  } | null> {
    // Temporary mock implementation to unblock UI
    if (!userId) return null;
    return {
      totalRatings: 25,
      averageRating: 4.2,
      totalComments: 48,
      totalLikes: 156,
      reputationScore: 850,
      level: 'Gold',
      badges: ['Story Master', 'Community Helper', 'Top Reviewer'],
      rank: 15,
      totalUsers: 1250
    };
  }

  async getCommunityStats(): Promise<{
    totalRatings: number;
    totalComments: number;
    totalUsers: number;
    averageRating: number;
    topContributors: Array<{ id: string; name: string; avatar: string; score: number }>;
    recentActivity: Array<{ id: string; type: 'rating' | 'comment' | 'like'; userName: string; storyTitle: string; createdAt: string }>;
  }> {
    // Temporary mock implementation to unblock UI
    return {
      totalRatings: 12500,
      totalComments: 8900,
      totalUsers: 1250,
      averageRating: 4.1,
      topContributors: [
        {
          id: '1',
          name: 'Alice Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          score: 2450
        },
        {
          id: '2',
          name: 'Bob Smith',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          score: 2200
        },
        {
          id: '3',
          name: 'Carol Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          score: 1980
        }
      ],
      recentActivity: [
        {
          id: '1',
          type: 'rating',
          userName: 'John Doe',
          storyTitle: 'The Mystery of the Lost Key',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'comment',
          userName: 'Jane Smith',
          storyTitle: 'Adventure in the Forest',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          type: 'like',
          userName: 'Alice Johnson',
          storyTitle: 'Galactic Odyssey',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    };
  }

  async getRatings(params: { rating?: number | null; sortBy?: 'newest' | 'oldest' | 'rating' | 'likes'; search?: string }): Promise<Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    storyId: string;
    storyTitle: string;
    rating: number;
    comment: string;
    createdAt: string;
    likes: number;
    dislikes: number;
    isLiked: boolean;
    isDisliked: boolean;
    isReported: boolean;
  }>> {
    const sample: Array<any> = [
      {
        id: 'r1', userId: 'u1', userName: 'Ava Thompson', userAvatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80',
        storyId: 's1', storyTitle: 'The Quantum Detective', rating: 5,
        comment: 'Brillante narrativa y decisiones significativas.',
        createdAt: new Date().toISOString(), likes: 34, dislikes: 2,
        isLiked: false, isDisliked: false, isReported: false
      },
      {
        id: 'r2', userId: 'u2', userName: 'Liam Carter', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
        storyId: 's2', storyTitle: 'Medieval Kingdom Builder', rating: 4,
        comment: 'Muy divertido, le faltó un poco de profundidad en las rutas.',
        createdAt: new Date(Date.now() - 3600_000).toISOString(), likes: 18, dislikes: 1,
        isLiked: false, isDisliked: false, isReported: false
      },
      {
        id: 'r3', userId: 'u3', userName: 'Sofia Martinez', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80',
        storyId: 's3', storyTitle: 'Shadows of Choice', rating: 3,
        comment: 'Interesante, pero algunas decisiones no tienen impacto claro.',
        createdAt: new Date(Date.now() - 2*3600_000).toISOString(), likes: 9, dislikes: 3,
        isLiked: false, isDisliked: false, isReported: false
      },
      {
        id: 'r4', userId: 'u4', userName: 'Noah Wilson', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        storyId: 's1', storyTitle: 'The Quantum Detective', rating: 5,
        comment: 'La mejor historia interactiva que he jugado.',
        createdAt: new Date(Date.now() - 24*3600_000).toISOString(), likes: 52, dislikes: 0,
        isLiked: false, isDisliked: false, isReported: false
      },
      {
        id: 'r5', userId: 'u5', userName: 'Emma Davis', userAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80',
        storyId: 's4', storyTitle: 'Digital Prophecy', rating: 2,
        comment: 'El ritmo es lento en el segundo acto.',
        createdAt: new Date(Date.now() - 48*3600_000).toISOString(), likes: 3, dislikes: 8,
        isLiked: false, isDisliked: false, isReported: false
      }
    ];

    let results = sample.slice();

    if (params?.rating) {
      results = results.filter(r => r.rating === params.rating);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter(r => r.userName.toLowerCase().includes(q) || r.storyTitle.toLowerCase().includes(q));
    }

    switch (params?.sortBy) {
      case 'oldest':
        results.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'likes':
        results.sort((a, b) => b.likes - a.likes);
        break;
      case 'newest':
      default:
        results.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
    }

    return results;
  }

  async getTopUsers(): Promise<Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    totalRatings: number;
    averageRating: number;
    totalLikes: number;
    totalComments: number;
    reputationScore: number;
    badges: string[];
    level: string;
    isFollowing: boolean;
  }>> {
    // Temporary mock implementation to unblock UI
    return [
      {
        userId: 'u10', userName: 'Alice Johnson', userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120',
        totalRatings: 120, averageRating: 4.8, totalLikes: 980, totalComments: 450, reputationScore: 2450, badges: ['Top Reviewer', 'Story Master'], level: 'Diamond', isFollowing: false
      },
      {
        userId: 'u11', userName: 'Bob Smith', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
        totalRatings: 110, averageRating: 4.6, totalLikes: 870, totalComments: 380, reputationScore: 2200, badges: ['Community Helper'], level: 'Platinum', isFollowing: false
      },
      {
        userId: 'u12', userName: 'Carol Davis', userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120',
        totalRatings: 95, averageRating: 4.5, totalLikes: 810, totalComments: 320, reputationScore: 1980, badges: ['Top Reviewer'], level: 'Gold', isFollowing: false
      }
    ];
  }

  async getReputationStats(): Promise<{
    totalRatings: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
    totalComments: number;
    totalLikes: number;
    topRatedStories: Array<{ id: string; title: string; rating: number; ratingsCount: number }>;
  }> {
    return {
      totalRatings: 12500,
      averageRating: 4.1,
      ratingDistribution: { 1: 480, 2: 940, 3: 2950, 4: 5200, 5: 3930 },
      totalComments: 8900,
      totalLikes: 25600,
      topRatedStories: [
        { id: 's1', title: 'The Quantum Detective', rating: 4.9, ratingsCount: 5400 },
        { id: 's2', title: 'Medieval Kingdom Builder', rating: 4.6, ratingsCount: 4200 },
        { id: 's3', title: 'Shadows of Choice', rating: 4.4, ratingsCount: 2900 }
      ]
    };
  }

  async likeRating(_ratingId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async dislikeRating(_ratingId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async reportRating(_ratingId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async followUser(_userId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  private getLevelName(level: number): string {
    const levelNames = [
      'Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master',
      'Grandmaster', 'Legend', 'Mythic', 'Immortal', 'Divine'
    ];
    
    if (level <= 10) return levelNames[Math.min(level - 1, levelNames.length - 1)];
    return `${levelNames[levelNames.length - 1]} ${level - 10}`;
  }

  private async checkAchievements(userId: string, totalPoints: number, level: number): Promise<void> {
    try {
      // Check point-based achievements
      const pointMilestones = [100, 500, 1000, 5000, 10000];
      for (const milestone of pointMilestones) {
        if (totalPoints >= milestone) {
          await this.awardAchievement(userId, `points_${milestone}`);
        }
      }

      // Check level-based achievements
      const levelMilestones = [5, 10, 25, 50, 100];
      for (const milestone of levelMilestones) {
        if (level >= milestone) {
          await this.awardAchievement(userId, `level_${milestone}`);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  private async awardAchievement(userId: string, achievementKey: string): Promise<void> {
    try {
      // Check if user already has this achievement
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_key', achievementKey)
        .single();

      if (existing) return; // Already has this achievement

      // Award the achievement
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_key: achievementKey,
          completed: true,
          completed_at: new Date().toISOString(),
          progress: 100
        });
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }
}

export const reputationApi = new ReputationApiService();