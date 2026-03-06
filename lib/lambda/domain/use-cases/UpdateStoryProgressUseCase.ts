import { StoryProgress } from '../entities/StoryProgress';
import { IStoryProgressRepository } from '../ports/IStoryProgressRepository';
import { ValidationError } from '../../shared/errors';

export interface UpdateStoryProgressInput {
  userId: string;
  storyId: string;
  checkpointId: string;
  nextCheckpointId: string | null;
  completedAt: string;
}

export class UpdateStoryProgressUseCase {
  constructor(private readonly repository: IStoryProgressRepository) {}

  async execute(input: UpdateStoryProgressInput): Promise<StoryProgress> {
    this.validateInput(input);

    let progress = await this.repository.getProgress(input.userId, input.storyId);

    if (!progress) {
      progress = StoryProgress.createNew(
        input.userId,
        input.storyId,
        input.checkpointId
      );
    }

    const updatedProgress = progress.markCheckpointComplete(
      input.checkpointId,
      input.completedAt,
      input.nextCheckpointId
    );

    await this.repository.saveProgress(updatedProgress);

    return updatedProgress;
  }

  private validateInput(input: UpdateStoryProgressInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }
    if (!input.storyId || input.storyId.trim().length === 0) {
      throw new ValidationError('storyId is required');
    }
    if (!input.checkpointId || input.checkpointId.trim().length === 0) {
      throw new ValidationError('checkpointId is required');
    }
    if (!input.completedAt || input.completedAt.trim().length === 0) {
      throw new ValidationError('completedAt is required');
    }
  }
}
