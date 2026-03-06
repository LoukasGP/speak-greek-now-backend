import { StoryProgress } from '../entities/StoryProgress';
import { IStoryProgressRepository } from '../ports/IStoryProgressRepository';
import { ValidationError } from '../../shared/errors';

export class GetAllUserStoriesUseCase {
  constructor(private readonly repository: IStoryProgressRepository) {}

  async execute(userId: string): Promise<StoryProgress[]> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }

    return await this.repository.getProgressByUser(userId);
  }
}
