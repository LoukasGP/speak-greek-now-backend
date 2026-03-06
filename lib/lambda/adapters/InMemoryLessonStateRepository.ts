import { UserLessonState } from '../domain/entities/activity-types';
import { ILessonStateRepository } from '../domain/ports/ILessonStateRepository';

export class InMemoryLessonStateRepository implements ILessonStateRepository {
  private store = new Map<string, UserLessonState>();

  private key(userId: string, lessonId: string): string {
    return `${userId}::${lessonId}`;
  }

  async getState(userId: string, lessonId: string): Promise<UserLessonState | null> {
    return this.store.get(this.key(userId, lessonId)) ?? null;
  }

  async putState(state: UserLessonState): Promise<void> {
    this.store.set(this.key(state.userId, state.lessonId), state);
  }

  async deleteState(userId: string, lessonId: string): Promise<void> {
    this.store.delete(this.key(userId, lessonId));
  }

  /** Test helper to clear all stored states */
  clear(): void {
    this.store.clear();
  }

  /** Test helper to get the number of stored states */
  size(): number {
    return this.store.size;
  }
}
