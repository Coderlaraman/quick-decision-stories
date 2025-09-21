import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Edit, Trash2, Flag, ThumbsUp, Reply, MoreHorizontal, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { reputationApi } from '../../lib/api/reputation';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  storyId: string;
  storyTitle: string;
  content: string;
  rating?: number;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  isLiked: boolean;
  isReported: boolean;
  isEdited: boolean;
  replies: Reply[];
  parentId?: string;
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  isReported: boolean;
}

interface CommentManagerProps {
  storyId?: string;
  userId?: string;
  showRating?: boolean;
}

const CommentManager: React.FC<CommentManagerProps> = ({ 
  storyId, 
  userId, 
  showRating = false 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes' | 'rating'>('newest');

  useEffect(() => {
    loadComments();
  }, [storyId, userId, sortBy]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const commentsData = await reputationApi.getComments({
        storyId,
        userId,
        sortBy
      });
      setComments(commentsData);
    } catch (err) {
      setError(t('reputation.errorLoadingComments'));
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || (showRating && newRating === 0)) return;
    
    try {
      setSubmitting(true);
      const commentData = {
        content: newComment,
        storyId,
        rating: showRating ? newRating : undefined
      };
      
      const newCommentObj = await reputationApi.createComment(commentData);
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      setNewRating(0);
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      const updatedComment = await reputationApi.updateComment(commentId, {
        content: editContent
      });
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? updatedComment : comment
      ));
      setEditingComment(null);
      setEditContent('');
    } catch (err) {
      console.error('Error editing comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm(t('reputation.confirmDeleteComment'))) return;
    
    try {
      await reputationApi.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleLikeComment = async (commentId: string, isReply = false) => {
    try {
      await reputationApi.likeComment(commentId);
      
      if (isReply) {
        setComments(prev => prev.map(comment => ({
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === commentId
              ? {
                  ...reply,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  isLiked: !reply.isLiked
                }
              : reply
          )
        })));
      } else {
        setComments(prev => prev.map(comment => 
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked
              }
            : comment
        ));
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleReplyToComment = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      const replyData = {
        content: replyContent,
        parentId,
        storyId
      };
      
      const newReply = await reputationApi.createReply(replyData);
      
      setComments(prev => prev.map(comment => 
        comment.id === parentId
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      ));
      
      setReplyingTo(null);
      setReplyContent('');
    } catch (err) {
      console.error('Error replying to comment:', err);
    }
  };

  const handleReportComment = async (commentId: string, isReply = false) => {
    try {
      await reputationApi.reportComment(commentId);
      
      if (isReply) {
        setComments(prev => prev.map(comment => ({
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === commentId ? { ...reply, isReported: true } : reply
          )
        })));
      } else {
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? { ...comment, isReported: true } : comment
        ));
      }
    } catch (err) {
      console.error('Error reporting comment:', err);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'
            }`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const startReplying = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('reputation.loadingComments')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadComments}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user && storyId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {showRating ? t('reputation.writeReview') : t('reputation.writeComment')}
          </h3>
          
          {showRating && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reputation.yourRating')}
              </label>
              {renderStars(newRating, true, setNewRating)}
            </div>
          )}
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={showRating ? t('reputation.reviewPlaceholder') : t('reputation.commentPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim() || (showRating && newRating === 0)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? t('reputation.submitting') : (showRating ? t('reputation.submitReview') : t('reputation.submitComment'))}
            </button>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('reputation.comments')} ({comments.length})
        </h3>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">{t('reputation.newest')}</option>
          <option value="oldest">{t('reputation.oldest')}</option>
          <option value="likes">{t('reputation.mostLiked')}</option>
          {showRating && <option value="rating">{t('reputation.highestRated')}</option>}
        </select>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('reputation.noComments')}
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{comment.userName}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      {comment.isEdited && (
                        <span className="text-gray-400">({t('reputation.edited')})</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {comment.rating && renderStars(comment.rating)}
                  
                  {comment.userId === user?.id && (
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Comment Content */}
              {editingComment === comment.id ? (
                <div className="mb-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setEditingComment(null)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mb-4">{comment.content}</p>
              )}

              {/* Comment Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                      comment.isLiked
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </button>

                  <button
                    onClick={() => startReplying(comment.id)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span>{t('reputation.reply')}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {comment.userId === user?.id && (
                    <>
                      <button
                        onClick={() => startEditing(comment)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {!comment.isReported && comment.userId !== user?.id && (
                    <button
                      onClick={() => handleReportComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={t('reputation.replyPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={() => handleReplyToComment(comment.id)}
                      disabled={!replyContent.trim()}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {t('reputation.reply')}
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <img
                            src={reply.userAvatar}
                            alt={reply.userName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">{reply.userName}</h5>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {!reply.isReported && reply.userId !== user?.id && (
                          <button
                            onClick={() => handleReportComment(reply.id, true)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                      
                      <button
                        onClick={() => handleLikeComment(reply.id, true)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                          reply.isLiked
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{reply.likes}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentManager;