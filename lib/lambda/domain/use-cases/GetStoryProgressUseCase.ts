import { StoryProgress } from '../entities/StoryProgress';
import { IStoryProgressRepository } from '../ports/IStoryProgressRepository';
import { ValidationError, StoryProgressNotFoundError } from '../../shared/errors';

export class GetStoryProgressUseCase {
  constructor(private readonly repository: IStoryProgressRepository) {}

  async execute(userId: string, storyId: string): Promise<StoryProgress> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }
    if (!storyId || storyId.trim().length === 0) {
      throw new ValidationError('storyId is required');
    }

    const progress = await this.repository.getProgress(userId, storyId);

    if (!progress) {
      throw new StoryProgressNotFoundError(userId, storyId);
    }

    return progress;
  }
}
