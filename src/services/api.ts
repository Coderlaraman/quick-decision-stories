// API service for reputation system
export const reputationApi = {
  getUserStats: async (userId: string) => {
    // Mock implementation - replace with actual API calls
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
  },

  getCommunityStats: async () => {
    // Mock implementation - replace with actual API calls
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
          type: 'rating' as const,
          userName: 'John Doe',
          storyTitle: 'The Mystery of the Lost Key',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'comment' as const,
          userName: 'Jane Smith',
          storyTitle: 'Adventure in the Forest',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    };
  },

  getComments: async (params: { storyId?: string; userId?: string; sortBy?: string }) => {
    // Mock implementation - replace with actual API calls
    return [];
  },

  createComment: async (commentData: any) => {
    // Mock implementation - replace with actual API calls
    return {
      id: Date.now().toString(),
      ...commentData,
      userId: 'current-user',
      userName: 'Current User',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      isReported: false,
      isEdited: false,
      replies: []
    };
  },

  updateComment: async (commentId: string, data: any) => {
    // Mock implementation - replace with actual API calls
    return {
      id: commentId,
      ...data,
      isEdited: true,
      updatedAt: new Date().toISOString()
    };
  },

  deleteComment: async (commentId: string) => {
    // Mock implementation - replace with actual API calls
    return { success: true };
  },

  likeComment: async (commentId: string) => {
    // Mock implementation - replace with actual API calls
    return { success: true };
  },

  createReply: async (replyData: any) => {
    // Mock implementation - replace with actual API calls
    return {
      id: Date.now().toString(),
      ...replyData,
      userId: 'current-user',
      userName: 'Current User',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      isReported: false
    };
  },

  reportComment: async (commentId: string) => {
    // Mock implementation - replace with actual API calls
    return { success: true };
  }
};