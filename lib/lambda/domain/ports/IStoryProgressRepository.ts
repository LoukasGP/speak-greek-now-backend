import { StoryProgress } from '../entities/StoryProgress';

export interface IStoryProgressRepository {
  getProgress(userId: string, storyId: string): Promise<StoryProgress | null>;
  saveProgress(progress: StoryProgress): Promise<void>;
  getProgressByUser(userId: string): Promise<StoryProgress[]>;
}
