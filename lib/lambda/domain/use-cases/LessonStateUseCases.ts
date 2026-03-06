import { UserLessonState } from '../entities/activity-types';
import { ILessonStateRepository } from '../ports/ILessonStateRepository';

export class GetLessonStateUseCase {
  constructor(private readonly repository: ILessonStateRepository) {}

  async execute(userId: string, lessonId: string): Promise<UserLessonState | null> {
    return this.repository.getState(userId, lessonId);
  }
}

export class PutLessonStateUseCase {
  constructor(private readonly repository: ILessonStateRepository) {}

  async execute(state: UserLessonState): Promise<void> {
    if (!state.userId) {
      throw new Error('userId is required');
    }
    if (!state.lessonId) {
      throw new Error('lessonId is required');
    }

    const normalized: UserLessonState = {
      userId: state.userId,
      lessonId: state.lessonId,
      revealedWords: state.revealedWords ?? [],
      sentenceNotes: state.sentenceNotes ?? [],
      wordNotes: state.wordNotes ?? [],
      comprehensionQuizResults: state.comprehensionQuizResults ?? [],
      englishVisible: state.englishVisible ?? true,
      sentencesBrokenUp: state.sentencesBrokenUp ?? false,
      followAlongEnabled: state.followAlongEnabled ?? false,
      lastAccessedAt: new Date().toISOString(),
    };

    await this.repository.putState(normalized);
  }
}

export class DeleteLessonStateUseCase {
  constructor(private readonly repository: ILessonStateRepository) {}

  async execute(userId: string, lessonId: string): Promise<void> {
    await this.repository.deleteState(userId, lessonId);
  }
}
