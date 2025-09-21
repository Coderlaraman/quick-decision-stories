import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { Image, Music, Volume2, Plus, Link, Trash2 } from 'lucide-react';
import { StoryScene, StoryOption } from '../../types/community';
import OptionCard from './OptionCard';

interface SceneEditorProps {
  scene: StoryScene;
  onUpdate: (updates: Partial<StoryScene>) => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, updates: Partial<StoryOption>) => void;
  onDeleteOption: (optionId: string) => void;
  availableScenes: StoryScene[];
}

const SceneEditor: React.FC<SceneEditorProps> = ({
  scene,
  onUpdate,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  availableScenes
}) => {
  const { t } = useTranslation();
  const [draggedOption, setDraggedOption] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'option',
    drop: (item: { id: string; index: number }, monitor) => {
      if (!monitor.didDrop()) {
        // Handle reordering logic here
        const dragIndex = item.index;
        const hoverIndex = scene.options.length;
        moveOption(dragIndex, hoverIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const moveOption = (dragIndex: number, hoverIndex: number) => {
    const draggedOption = scene.options[dragIndex];
    const newOptions = [...scene.options];
    newOptions.splice(dragIndex, 1);
    newOptions.splice(hoverIndex, 0, draggedOption);
    
    // Update order indices
    const updatedOptions = newOptions.map((option, index) => ({
      ...option,
      order_index: index
    }));
    
    onUpdate({ options: updatedOptions });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to a service like Supabase Storage
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ image_url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'music' | 'sound') => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to a service like Supabase Storage
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'music') {
          onUpdate({ background_music: e.target?.result as string });
        } else {
          onUpdate({ 
            sound_effects: [...(scene.sound_effects || []), e.target?.result as string]
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Scene Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('editor.sceneTitle')}
            </label>
            <input
              type="text"
              value={scene.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('editor.sceneTitlePlaceholder')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('editor.sceneContent')}
            </label>
            <textarea
              value={scene.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={t('editor.sceneContentPlaceholder')}
            />
          </div>
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('editor.media')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('editor.sceneImage')}
            </label>
            <div className="relative">
              {scene.image_url ? (
                <div className="relative">
                  <img
                    src={scene.image_url}
                    alt="Scene"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => onUpdate({ image_url: null })}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <Image className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">{t('editor.uploadImage')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Background Music */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('editor.backgroundMusic')}
            </label>
            <div className="relative">
              {scene.background_music ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{t('editor.musicUploaded')}</span>
                  </div>
                  <button
                    onClick={() => onUpdate({ background_music: null })}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <Music className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">{t('editor.uploadMusic')}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleAudioUpload(e, 'music')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Sound Effects */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('editor.soundEffects')}
            </label>
            <div className="space-y-2">
              {scene.sound_effects?.map((sound, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-3 h-3 text-gray-600" />
                    <span className="text-xs text-gray-700">{t('editor.soundEffect')} {index + 1}</span>
                  </div>
                  <button
                    onClick={() => {
                      const newSounds = scene.sound_effects?.filter((_, i) => i !== index) || [];
                      onUpdate({ sound_effects: newSounds });
                    }}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-2 h-2" />
                  </button>
                </div>
              ))}
              
              <label className="flex items-center justify-center w-full p-2 border border-gray-300 border-dashed rounded cursor-pointer hover:bg-gray-50">
                <Plus className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">{t('editor.addSoundEffect')}</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleAudioUpload(e, 'sound')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Options Section */}
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('editor.sceneOptions')}</h3>
          <button
            onClick={onAddOption}
            className="flex items-center px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('editor.addOption')}
          </button>
        </div>

        <div ref={drop} className={`space-y-3 min-h-32 ${isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg' : ''}`}>
          {scene.options.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              index={index}
              onUpdate={(updates) => onUpdateOption(option.id, updates)}
              onDelete={() => onDeleteOption(option.id)}
              onMove={moveOption}
              availableScenes={availableScenes}
            />
          ))}
          
          {scene.options.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Link className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('editor.noOptions')}</p>
              <p className="text-sm">{t('editor.addFirstOption')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneEditor;