import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { Plus, Save, Eye, Trash2, Settings } from 'lucide-react';
import { CommunityStory, StoryScene, StoryOption } from '../../types/community';
import SceneEditor from './SceneEditor';
import OptionsPanel from './OptionsPanel';
import StoryPreview from './StoryPreview';
import StorySettings from './StorySettings';

interface StoryEditorProps {
  story?: CommunityStory;
  onSave: (story: Partial<CommunityStory>) => void;
  onPreview: (story: CommunityStory) => void;
}

const StoryEditor: React.FC<StoryEditorProps> = ({ story, onSave, onPreview }) => {
  const { t } = useTranslation();
  const [currentStory, setCurrentStory] = useState<Partial<CommunityStory>>(story || {
    title: '',
    description: '',
    category: 'adventure',
    difficulty: 'medium',
    estimated_duration: 15,
    tags: [],
    is_premium: false,
    price: null,
    scenes: []
  });
  
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const addScene = useCallback(() => {
    const newScene: StoryScene = {
      id: `scene_${Date.now()}`,
      title: t('editor.newScene'),
      content: '',
      image_url: null,
      background_music: null,
      sound_effects: [],
      order_index: (currentStory.scenes?.length || 0) + 1,
      options: []
    };
    
    setCurrentStory(prev => ({
      ...prev,
      scenes: [...(prev.scenes || []), newScene]
    }));
    setSelectedSceneId(newScene.id);
  }, [currentStory.scenes, t]);

  const updateScene = useCallback((sceneId: string, updates: Partial<StoryScene>) => {
    setCurrentStory(prev => ({
      ...prev,
      scenes: prev.scenes?.map(scene => 
        scene.id === sceneId ? { ...scene, ...updates } : scene
      ) || []
    }));
  }, []);

  const deleteScene = useCallback((sceneId: string) => {
    setCurrentStory(prev => ({
      ...prev,
      scenes: prev.scenes?.filter(scene => scene.id !== sceneId) || []
    }));
    if (selectedSceneId === sceneId) {
      setSelectedSceneId(null);
    }
  }, [selectedSceneId]);

  const addOption = useCallback((sceneId: string) => {
    const newOption: StoryOption = {
      id: `option_${Date.now()}`,
      text: t('editor.newOption'),
      next_scene_id: null,
      consequences: {},
      requirements: {},
      order_index: 0
    };

    updateScene(sceneId, {
      options: [...(currentStory.scenes?.find(s => s.id === sceneId)?.options || []), newOption]
    });
  }, [currentStory.scenes, updateScene, t]);

  const updateOption = useCallback((sceneId: string, optionId: string, updates: Partial<StoryOption>) => {
    const scene = currentStory.scenes?.find(s => s.id === sceneId);
    if (!scene) return;

    const updatedOptions = scene.options.map(option => 
      option.id === optionId ? { ...option, ...updates } : option
    );

    updateScene(sceneId, { options: updatedOptions });
  }, [currentStory.scenes, updateScene]);

  const deleteOption = useCallback((sceneId: string, optionId: string) => {
    const scene = currentStory.scenes?.find(s => s.id === sceneId);
    if (!scene) return;

    const updatedOptions = scene.options.filter(option => option.id !== optionId);
    updateScene(sceneId, { options: updatedOptions });
  }, [currentStory.scenes, updateScene]);

  const handleSave = () => {
    onSave(currentStory);
  };

  const handlePreview = () => {
    if (currentStory.scenes && currentStory.scenes.length > 0) {
      onPreview(currentStory as CommunityStory);
      setShowPreview(true);
    }
  };

  const selectedScene = currentStory.scenes?.find(scene => scene.id === selectedSceneId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentStory.title || t('editor.untitledStory')}
              </h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {currentStory.scenes?.length || 0} {t('editor.scenes')}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('editor.settings')}
              </button>
              
              <button
                onClick={handlePreview}
                disabled={!currentStory.scenes || currentStory.scenes.length === 0}
                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('editor.preview')}
              </button>
              
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('editor.save')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Scenes Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={addScene}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('editor.addScene')}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentStory.scenes?.map((scene, index) => (
                <div
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSceneId === scene.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-500">
                          {t('editor.scene')} {index + 1}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 truncate">
                        {scene.title}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {scene.options.length} {t('editor.options')}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScene(scene.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {(!currentStory.scenes || currentStory.scenes.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>{t('editor.noScenes')}</p>
                  <p className="text-sm">{t('editor.addFirstScene')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Scene Editor */}
          <div className="flex-1 flex flex-col">
            {selectedScene ? (
              <SceneEditor
                scene={selectedScene}
                onUpdate={(updates) => updateScene(selectedScene.id, updates)}
                onAddOption={() => addOption(selectedScene.id)}
                onUpdateOption={(optionId, updates) => updateOption(selectedScene.id, optionId, updates)}
                onDeleteOption={(optionId) => deleteOption(selectedScene.id, optionId)}
                availableScenes={currentStory.scenes || []}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg">{t('editor.selectScene')}</p>
                  <p className="text-sm">{t('editor.selectSceneHint')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showSettings && (
          <StorySettings
            story={currentStory}
            onUpdate={setCurrentStory}
            onClose={() => setShowSettings(false)}
          />
        )}
        
        {showPreview && (
          <StoryPreview
            story={currentStory as CommunityStory}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default StoryEditor;