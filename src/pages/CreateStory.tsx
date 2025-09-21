import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CommunityStory } from '../types/community';
import { createCommunityStory, updateCommunityStory } from '../lib/api/community';
import StoryEditor from '../components/StoryEditor/StoryEditor';
import { useAuth } from '../contexts/AuthContext';

interface CreateStoryProps {
  storyId?: string;
}

const CreateStory: React.FC<CreateStoryProps> = ({ storyId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState<CommunityStory | undefined>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storyId) {
      // Load existing story for editing
      // This would fetch from the API in a real implementation
      setLoading(true);
      // Simulated API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [storyId]);

  const handleSave = async (storyData: Partial<CommunityStory>) => {
    if (!user) {
      setError(t('editor.loginRequired'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const storyToSave = {
        ...storyData,
        author_id: user.id,
        status: 'draft' as const
      };

      let savedStoryResponse;
      if (storyId) {
        savedStoryResponse = await updateCommunityStory(storyId, storyToSave);
      } else {
        savedStoryResponse = await createCommunityStory(storyToSave);
      }

      const savedStory = savedStoryResponse.data;
      setStory(savedStory);
      
      // Show success message
      // In a real app, you might use a toast notification
      alert(t('editor.storySaved'));
      
      // Navigate to the story if it's a new creation
      if (!storyId && savedStory?.id) {
        navigate(`/create/${savedStory.id}`);
      }
    } catch (err) {
      console.error('Error saving story:', err);
      setError(t('editor.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (storyData: CommunityStory) => {
    // Preview functionality is handled by the StoryEditor component
    console.log('Previewing story:', storyData);
  };

  const handleBack = () => {
    if (window.confirm(t('editor.confirmLeave'))) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('editor.loadingStory')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <h1 className="text-lg font-semibold text-gray-900">
              {storyId ? t('editor.editStory') : t('editor.createNewStory')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {saving && (
              <div className="flex items-center text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                {t('editor.saving')}
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Story Editor */}
      <div className="max-w-7xl mx-auto">
        <StoryEditor
          story={story}
          onSave={handleSave}
          onPreview={handlePreview}
        />
      </div>
    </div>
  );
};

export default CreateStory;