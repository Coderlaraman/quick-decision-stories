import { useState, useEffect, useCallback } from 'react';
import { GameState, UserProgress, Story, StoryScene } from '../types/story';
import { stories } from '../data/stories';

const STORAGE_KEY = 'quick-decision-stories-progress';
const TIMER_DURATION = 10; // seconds

const defaultProgress: UserProgress = {
  completedStories: [],
  unlockedEndings: {},
  achievements: [],
  totalPlayTime: 0
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentStory: null,
    currentScene: null,
    timeRemaining: TIMER_DURATION,
    isPlaying: false,
    userProgress: defaultProgress
  });

  const [isTimerActive, setIsTimerActive] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setGameState(prev => ({
          ...prev,
          userProgress: { ...defaultProgress, ...progress }
        }));
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((progress: UserProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    setGameState(prev => ({ ...prev, userProgress: progress }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || gameState.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeRemaining - 0.1;
        if (newTime <= 0) {
          setIsTimerActive(false);
          // Auto-select default option
          if (prev.currentScene && !prev.currentScene.isEnding) {
            const defaultOption = prev.currentScene.options.find(opt => opt.isDefault) || prev.currentScene.options[0];
            setTimeout(() => makeChoice(defaultOption.id), 100);
          }
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isTimerActive, gameState.timeRemaining, gameState.currentScene]);

  const startStory = useCallback((storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    const firstScene = story.scenes[0];
    setGameState(prev => ({
      ...prev,
      currentStory: story,
      currentScene: firstScene,
      timeRemaining: TIMER_DURATION,
      isPlaying: true
    }));
    
    if (!firstScene.isEnding) {
      setIsTimerActive(true);
    }
  }, []);

  const makeChoice = useCallback((optionId: string) => {
    if (!gameState.currentStory || !gameState.currentScene) return;

    const option = gameState.currentScene.options.find(opt => opt.id === optionId);
    if (!option) return;

    setIsTimerActive(false);

    // If this leads to an ending, handle completion
    if (!option.nextSceneId) {
      const endingScene = gameState.currentScene;
      const updatedProgress = { ...gameState.userProgress };
      
      // Mark story as completed
      if (!updatedProgress.completedStories.includes(gameState.currentStory.id)) {
        updatedProgress.completedStories.push(gameState.currentStory.id);
      }

      // Add unlocked ending
      if (!updatedProgress.unlockedEndings[gameState.currentStory.id]) {
        updatedProgress.unlockedEndings[gameState.currentStory.id] = [];
      }
      if (!updatedProgress.unlockedEndings[gameState.currentStory.id].includes(endingScene.id)) {
        updatedProgress.unlockedEndings[gameState.currentStory.id].push(endingScene.id);
      }

      // Check for achievements
      const totalEndings = updatedProgress.unlockedEndings[gameState.currentStory.id]?.length || 0;
      const newAchievements = [];

      if (totalEndings >= 3 && !updatedProgress.achievements.includes('explorer')) {
        newAchievements.push('explorer');
      }
      
      if (updatedProgress.completedStories.length >= 3 && !updatedProgress.achievements.includes('storyteller')) {
        newAchievements.push('storyteller');
      }

      updatedProgress.achievements.push(...newAchievements);
      updatedProgress.totalPlayTime += 1; // Simplified play time tracking

      saveProgress(updatedProgress);
      return;
    }

    // Move to next scene
    const nextScene = gameState.currentStory.scenes.find(scene => scene.id === option.nextSceneId);
    if (nextScene) {
      setGameState(prev => ({
        ...prev,
        currentScene: nextScene,
        timeRemaining: TIMER_DURATION
      }));

      if (!nextScene.isEnding) {
        setIsTimerActive(true);
      }
    }
  }, [gameState.currentStory, gameState.currentScene, gameState.userProgress, saveProgress]);

  const restartStory = useCallback(() => {
    if (gameState.currentStory) {
      startStory(gameState.currentStory.id);
    }
  }, [gameState.currentStory, startStory]);

  const exitToHome = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentStory: null,
      currentScene: null,
      timeRemaining: TIMER_DURATION,
      isPlaying: false
    }));
    setIsTimerActive(false);
  }, []);

  const getStoryProgress = useCallback((storyId: string) => {
    const endings = gameState.userProgress.unlockedEndings[storyId] || [];
    const story = stories.find(s => s.id === storyId);
    const totalEndings = story ? story.scenes.filter(scene => scene.isEnding).length : 0;
    
    return {
      endingsUnlocked: endings.length,
      totalEndings,
      isCompleted: gameState.userProgress.completedStories.includes(storyId),
      progressPercentage: totalEndings > 0 ? Math.round((endings.length / totalEndings) * 100) : 0
    };
  }, [gameState.userProgress]);

  return {
    gameState,
    isTimerActive,
    stories,
    startStory,
    makeChoice,
    restartStory,
    exitToHome,
    getStoryProgress
  };
};