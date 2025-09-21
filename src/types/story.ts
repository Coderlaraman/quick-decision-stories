export interface StoryOption {
  id: string;
  text: string;
  nextSceneId: string | null; // null indicates an ending
  isDefault?: boolean; // Used when timer expires
}

export interface StoryScene {
  id: string;
  title: string;
  content: string;
  image?: string;
  options: StoryOption[];
  isEnding?: boolean;
  endingType?: 'happy' | 'neutral' | 'tragic' | 'mysterious';
}

export interface Story {
  id: string;
  title: string;
  description: string;
  author: string;
  image: string;
  scenes: StoryScene[];
  estimatedTime: number; // in minutes
  tags: string[];
}

export interface UserProgress {
  completedStories: string[];
  unlockedEndings: { [storyId: string]: string[] };
  achievements: string[];
  totalPlayTime: number;
}

export interface GameState {
  currentStory: Story | null;
  currentScene: StoryScene | null;
  timeRemaining: number;
  isPlaying: boolean;
  userProgress: UserProgress;
}