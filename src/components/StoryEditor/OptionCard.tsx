import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { GripVertical, Trash2, Link, Plus, Minus } from 'lucide-react';
import { StoryOption, StoryScene } from '../../types/community';

interface OptionCardProps {
  option: StoryOption;
  index: number;
  onUpdate: (updates: Partial<StoryOption>) => void;
  onDelete: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  availableScenes: StoryScene[];
}

const OptionCard: React.FC<OptionCardProps> = ({
  option,
  index,
  onUpdate,
  onDelete,
  onMove,
  availableScenes
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'option',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'option',
    item: () => {
      return { id: option.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const addConsequence = () => {
    const newConsequences = {
      ...option.consequences,
      [`stat_${Date.now()}`]: 1
    };
    onUpdate({ consequences: newConsequences });
  };

  const updateConsequence = (key: string, value: number) => {
    const newConsequences = { ...option.consequences };
    newConsequences[key] = value;
    onUpdate({ consequences: newConsequences });
  };

  const removeConsequence = (key: string) => {
    const newConsequences = { ...option.consequences };
    delete newConsequences[key];
    onUpdate({ consequences: newConsequences });
  };

  const addRequirement = () => {
    const newRequirements = {
      ...option.requirements,
      [`stat_${Date.now()}`]: 1
    };
    onUpdate({ requirements: newRequirements });
  };

  const updateRequirement = (key: string, value: number) => {
    const newRequirements = { ...option.requirements };
    newRequirements[key] = value;
    onUpdate({ requirements: newRequirements });
  };

  const removeRequirement = (key: string) => {
    const newRequirements = { ...option.requirements };
    delete newRequirements[key];
    onUpdate({ requirements: newRequirements });
  };

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-3">
        {/* Drag Handle */}
        <div className="flex-shrink-0 mt-1 cursor-move text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Option Content */}
        <div className="flex-1 space-y-4">
          {/* Option Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('editor.optionText')}
            </label>
            <textarea
              value={option.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={t('editor.optionTextPlaceholder')}
            />
          </div>

          {/* Next Scene Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('editor.nextScene')}
            </label>
            <select
              value={option.next_scene_id || ''}
              onChange={(e) => onUpdate({ next_scene_id: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('editor.selectNextScene')}</option>
              <option value="END">{t('editor.endStory')}</option>
              {availableScenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.title}
                </option>
              ))}
            </select>
          </div>

          {/* Consequences */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('editor.consequences')}
              </label>
              <button
                onClick={addConsequence}
                className="flex items-center text-xs text-green-600 hover:text-green-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                {t('editor.add')}
              </button>
            </div>
            
            <div className="space-y-2">
              {Object.entries(option.consequences || {}).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const newConsequences = { ...option.consequences };
                      delete newConsequences[key];
                      newConsequences[newKey] = value;
                      onUpdate({ consequences: newConsequences });
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder={t('editor.statName')}
                  />
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateConsequence(key, parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeConsequence(key)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('editor.requirements')}
              </label>
              <button
                onClick={addRequirement}
                className="flex items-center text-xs text-green-600 hover:text-green-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                {t('editor.add')}
              </button>
            </div>
            
            <div className="space-y-2">
              {Object.entries(option.requirements || {}).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const newRequirements = { ...option.requirements };
                      delete newRequirements[key];
                      newRequirements[newKey] = value;
                      onUpdate({ requirements: newRequirements });
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder={t('editor.statName')}
                  />
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateRequirement(key, parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeRequirement(key)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex-shrink-0">
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionCard;