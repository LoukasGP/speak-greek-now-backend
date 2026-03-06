import { StoryProgress } from '../domain/entities/StoryProgress';
import { IStoryProgressRepository } from '../domain/ports/IStoryProgressRepository';

export class InMemoryStoryProgressRepository implements IStoryProgressRepository {
  private store: Map<string, StoryProgress> = new Map();

  private key(userId: string, storyId: string): string {
    return `${userId}#${storyId}`;
  }

  async getProgress(userId: string, storyId: string): Promise<StoryProgress | null> {
    return this.store.get(this.key(userId, storyId)) || null;
  }

  async saveProgress(progress: StoryProgress): Promise<void> {
    this.store.set(this.key(progress.userId, progress.storyId), progress);
  }

  async getProgressByUser(userId: string): Promise<StoryProgress[]> {
    const results: StoryProgress[] = [];
    for (const [key, progress] of this.store) {
      if (key.startsWith(`${userId}#`)) {
        results.push(progress);
      }
    }
    return results;
  }

  seed(progress: StoryProgress): void {
    this.store.set(this.key(progress.userId, progress.storyId), progress);
  }

  clear(): void {
    this.store.clear();
  }

  count(): number {
    return this.store.size;
  }
}
