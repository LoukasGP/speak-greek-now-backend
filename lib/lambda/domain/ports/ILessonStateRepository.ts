import { UserLessonState } from '../entities/activity-types';

/**
 * Port for the UserLessonState repository.
 *
 * DynamoDB key schema:
 *   pk = USER#{userId}
 *   sk = LESSONSTATE#{lessonId}
 */
export interface ILessonStateRepository {
  /**
   * Get the user's lesson state for a specific lesson.
   * Returns null if no state exists yet.
   */
  getState(userId: string, lessonId: string): Promise<UserLessonState | null>;

  /**
   * Create or fully replace the user's lesson state for a specific lesson.
   */
  putState(state: UserLessonState): Promise<void>;

  /**
   * Delete the user's lesson state for a specific lesson.
   */
  deleteState(userId: string, lessonId: string): Promise<void>;
}
