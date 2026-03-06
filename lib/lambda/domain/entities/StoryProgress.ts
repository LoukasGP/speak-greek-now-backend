import { CheckpointCompletion } from './activity-types';
import { ValidationError } from '../../shared/errors';

export class StoryProgress {
  constructor(
    public readonly userId: string,
    public readonly storyId: string,
    public readonly currentCheckpointId: string,
    public readonly checkpointsCompleted: readonly CheckpointCompletion[],
    public readonly startedAt: string,
    public readonly completedAt: string | null
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new ValidationError('userId is required and cannot be empty');
    }
    if (!this.storyId || this.storyId.trim().length === 0) {
      throw new ValidationError('storyId is required and cannot be empty');
    }
    if (!this.currentCheckpointId || this.currentCheckpointId.trim().length === 0) {
      throw new ValidationError('currentCheckpointId is required and cannot be empty');
    }
    if (!this.startedAt || this.startedAt.trim().length === 0) {
      throw new ValidationError('startedAt is required and cannot be empty');
    }
  }

  markCheckpointComplete(
    checkpointId: string,
    completedAt: string,
    nextCheckpointId: string | null
  ): StoryProgress {
    if (this.hasCompletedCheckpoint(checkpointId)) {
      return this;
    }

    const newCompletion: CheckpointCompletion = {
      checkpointId,
      completedAt,
    };

    const newCheckpointsCompleted = [...this.checkpointsCompleted, newCompletion];

    return new StoryProgress(
      this.userId,
      this.storyId,
      nextCheckpointId ?? this.currentCheckpointId,
      newCheckpointsCompleted,
      this.startedAt,
      nextCheckpointId === null ? completedAt : null
    );
  }

  hasCompletedCheckpoint(checkpointId: string): boolean {
    return this.checkpointsCompleted.some((c) => c.checkpointId === checkpointId);
  }

  getCompletionCount(): number {
    return this.checkpointsCompleted.length;
  }

  isStoryComplete(): boolean {
    return this.completedAt !== null;
  }

  toJSON(): Record<string, unknown> {
    return {
      userId: this.userId,
      storyId: this.storyId,
      currentCheckpointId: this.currentCheckpointId,
      checkpointsCompleted: this.checkpointsCompleted.map((c) => ({
        checkpointId: c.checkpointId,
        completedAt: c.completedAt,
      })),
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }

  static fromJSON(data: Record<string, any>): StoryProgress {
    return new StoryProgress(
      data.userId,
      data.storyId,
      data.currentCheckpointId,
      data.checkpointsCompleted || [],
      data.startedAt,
      data.completedAt ?? null
    );
  }

  static createNew(
    userId: string,
    storyId: string,
    firstCheckpointId: string
  ): StoryProgress {
    return new StoryProgress(
      userId,
      storyId,
      firstCheckpointId,
      [],
      new Date().toISOString(),
      null
    );
  }
}
