import { InMemoryLessonStateRepository } from '../lib/lambda/adapters/InMemoryLessonStateRepository';
import {
  GetLessonStateUseCase,
  PutLessonStateUseCase,
  DeleteLessonStateUseCase,
} from '../lib/lambda/domain/use-cases/LessonStateUseCases';
import { UserLessonState } from '../lib/lambda/domain/entities/activity-types';

describe('LessonState Use Cases', () => {
  let repository: InMemoryLessonStateRepository;
  let getUseCase: GetLessonStateUseCase;
  let putUseCase: PutLessonStateUseCase;
  let deleteUseCase: DeleteLessonStateUseCase;

  const sampleState: UserLessonState = {
    userId: 'user-123',
    lessonId: 'meeting-new-friends-in-athens',
    revealedWords: ['γεια', 'σπίτι'],
    sentenceNotes: [
      { sentenceIndex: 0, note: 'Good opening sentence', updatedAt: '2025-01-01T00:00:00Z' },
    ],
    wordNotes: [
      { word: 'γεια', note: 'Hello/Hi', updatedAt: '2025-01-01T00:00:00Z' },
    ],
    comprehensionQuizResults: [
      { questionIndex: 0, selectedAnswer: 2, correct: true },
    ],
    englishVisible: true,
    sentencesBrokenUp: false,
    followAlongEnabled: false,
    lastAccessedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    repository = new InMemoryLessonStateRepository();
    getUseCase = new GetLessonStateUseCase(repository);
    putUseCase = new PutLessonStateUseCase(repository);
    deleteUseCase = new DeleteLessonStateUseCase(repository);
  });

  describe('GetLessonStateUseCase', () => {
    it('returns null when no state exists', async () => {
      const result = await getUseCase.execute('user-123', 'nonexistent-lesson');
      expect(result).toBeNull();
    });

    it('returns the state when it exists', async () => {
      await repository.putState(sampleState);
      const result = await getUseCase.execute('user-123', 'meeting-new-friends-in-athens');
      expect(result).toEqual(sampleState);
    });
  });

  describe('PutLessonStateUseCase', () => {
    it('saves a new lesson state', async () => {
      await putUseCase.execute(sampleState);
      const result = await repository.getState('user-123', 'meeting-new-friends-in-athens');
      expect(result).not.toBeNull();
      expect(result!.userId).toBe('user-123');
      expect(result!.lessonId).toBe('meeting-new-friends-in-athens');
      expect(result!.revealedWords).toEqual(['γεια', 'σπίτι']);
    });

    it('updates an existing lesson state', async () => {
      await putUseCase.execute(sampleState);
      const updated = { ...sampleState, revealedWords: ['γεια', 'σπίτι', 'βράδυ'] };
      await putUseCase.execute(updated);
      const result = await repository.getState('user-123', 'meeting-new-friends-in-athens');
      expect(result!.revealedWords).toEqual(['γεια', 'σπίτι', 'βράδυ']);
    });

    it('throws if userId is missing', async () => {
      const invalid = { ...sampleState, userId: '' };
      await expect(putUseCase.execute(invalid)).rejects.toThrow('userId is required');
    });

    it('throws if lessonId is missing', async () => {
      const invalid = { ...sampleState, lessonId: '' };
      await expect(putUseCase.execute(invalid)).rejects.toThrow('lessonId is required');
    });

    it('sets lastAccessedAt to current time', async () => {
      const before = new Date().toISOString();
      await putUseCase.execute(sampleState);
      const result = await repository.getState('user-123', 'meeting-new-friends-in-athens');
      expect(result!.lastAccessedAt >= before).toBeTruthy();
    });

    it('defaults followAlongEnabled to false', async () => {
      const stateWithoutFollowAlong = { ...sampleState };
      await putUseCase.execute(stateWithoutFollowAlong);
      const result = await repository.getState('user-123', 'meeting-new-friends-in-athens');
      expect(result!.followAlongEnabled).toBe(false);
    });
  });

  describe('DeleteLessonStateUseCase', () => {
    it('deletes an existing state', async () => {
      await repository.putState(sampleState);
      await deleteUseCase.execute('user-123', 'meeting-new-friends-in-athens');
      const result = await repository.getState('user-123', 'meeting-new-friends-in-athens');
      expect(result).toBeNull();
    });

    it('does not throw when deleting a non-existent state', async () => {
      await expect(
        deleteUseCase.execute('user-123', 'nonexistent')
      ).resolves.not.toThrow();
    });
  });

  describe('InMemoryLessonStateRepository', () => {
    it('isolates states by user and lesson', async () => {
      await repository.putState(sampleState);
      await repository.putState({
        ...sampleState,
        userId: 'user-456',
        revealedWords: ['άλλο'],
      });

      const state1 = await repository.getState('user-123', 'meeting-new-friends-in-athens');
      const state2 = await repository.getState('user-456', 'meeting-new-friends-in-athens');

      expect(state1!.revealedWords).toEqual(['γεια', 'σπίτι']);
      expect(state2!.revealedWords).toEqual(['άλλο']);
      expect(repository.size()).toBe(2);
    });

    it('clear removes all states', async () => {
      await repository.putState(sampleState);
      repository.clear();
      expect(repository.size()).toBe(0);
    });
  });
});
