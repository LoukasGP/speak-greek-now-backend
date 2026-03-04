import {
  AddWordUseCase,
  RemoveWordUseCase,
  GetWordsUseCase,
  MoveWordUseCase,
} from '../../lib/lambda/domain/use-cases/WordBankUseCases';
import { InMemoryWordBankRepository } from '../../lib/lambda/adapters/InMemoryWordBankRepository';
import { StoredWord } from '../../lib/lambda/domain/entities/activity-types';
import { ValidationError, WordNotFoundError } from '../../lib/lambda/shared/errors';

describe('WordBankUseCases', () => {
  let repository: InMemoryWordBankRepository;

  const testWord: StoredWord = {
    greek: 'καλημέρα',
    english: 'good morning',
    lessonId: 'greetings-1',
    addedAt: '2026-03-04T10:00:00.000Z',
  };

  const anotherWord: StoredWord = {
    greek: 'ευχαριστώ',
    english: 'thank you',
    lessonId: 'greetings-1',
    addedAt: '2026-03-04T11:00:00.000Z',
  };

  beforeEach(() => {
    repository = new InMemoryWordBankRepository();
  });

  // ─── AddWordUseCase ─────────────────────────────────────────────────

  describe('AddWordUseCase', () => {
    let useCase: AddWordUseCase;

    beforeEach(() => {
      useCase = new AddWordUseCase(repository);
    });

    it('should store a word in the UNKNOWN bank', async () => {
      await useCase.execute('user-1', 'UNKNOWN', testWord);

      const words = await repository.getWords('user-1', 'UNKNOWN');
      expect(words).toHaveLength(1);
      expect(words[0].greek).toBe('καλημέρα');
      expect(words[0].english).toBe('good morning');
      expect(words[0].lessonId).toBe('greetings-1');
    });

    it('should store a word in the LEARNED bank', async () => {
      await useCase.execute('user-1', 'LEARNED', testWord);

      const words = await repository.getWords('user-1', 'LEARNED');
      expect(words).toHaveLength(1);
      expect(words[0].greek).toBe('καλημέρα');
    });

    it('should be idempotent — same greek word overwrites', async () => {
      await useCase.execute('user-1', 'UNKNOWN', testWord);

      const updatedWord: StoredWord = {
        ...testWord,
        english: 'hello (morning)',
      };
      await useCase.execute('user-1', 'UNKNOWN', updatedWord);

      const words = await repository.getWords('user-1', 'UNKNOWN');
      expect(words).toHaveLength(1);
      expect(words[0].english).toBe('hello (morning)');
    });

    it('should trim the greek field', async () => {
      const wordWithSpaces: StoredWord = {
        ...testWord,
        greek: '  καλημέρα  ',
      };
      await useCase.execute('user-1', 'UNKNOWN', wordWithSpaces);

      const hasWord = await repository.hasWord('user-1', 'UNKNOWN', 'καλημέρα');
      expect(hasWord).toBe(true);
    });

    it('should throw ValidationError for empty greek', async () => {
      const badWord: StoredWord = { ...testWord, greek: '' };
      await expect(useCase.execute('user-1', 'UNKNOWN', badWord)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty english', async () => {
      const badWord: StoredWord = { ...testWord, english: '' };
      await expect(useCase.execute('user-1', 'UNKNOWN', badWord)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty lessonId', async () => {
      const badWord: StoredWord = { ...testWord, lessonId: '' };
      await expect(useCase.execute('user-1', 'UNKNOWN', badWord)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty userId', async () => {
      await expect(useCase.execute('', 'UNKNOWN', testWord)).rejects.toThrow(ValidationError);
    });
  });

  // ─── RemoveWordUseCase ──────────────────────────────────────────────

  describe('RemoveWordUseCase', () => {
    let useCase: RemoveWordUseCase;

    beforeEach(() => {
      useCase = new RemoveWordUseCase(repository);
    });

    it('should remove an existing word', async () => {
      await repository.addWord('user-1', 'UNKNOWN', testWord);

      await useCase.execute('user-1', 'UNKNOWN', 'καλημέρα');

      const words = await repository.getWords('user-1', 'UNKNOWN');
      expect(words).toHaveLength(0);
    });

    it('should be a no-op for non-existent word', async () => {
      await expect(useCase.execute('user-1', 'UNKNOWN', 'nonexistent')).resolves.toBeUndefined();
    });

    it('should throw ValidationError for empty userId', async () => {
      await expect(useCase.execute('', 'UNKNOWN', 'καλημέρα')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty greek', async () => {
      await expect(useCase.execute('user-1', 'UNKNOWN', '')).rejects.toThrow(ValidationError);
    });
  });

  // ─── GetWordsUseCase ────────────────────────────────────────────────

  describe('GetWordsUseCase', () => {
    let useCase: GetWordsUseCase;

    beforeEach(async () => {
      useCase = new GetWordsUseCase(repository);
      await repository.addWord('user-1', 'UNKNOWN', testWord);
      await repository.addWord('user-1', 'LEARNED', anotherWord);
    });

    it('should return only UNKNOWN words when bank specified', async () => {
      const words = await useCase.execute('user-1', 'UNKNOWN');

      expect(Array.isArray(words)).toBe(true);
      expect(words).toHaveLength(1);
      expect((words as StoredWord[])[0].greek).toBe('καλημέρα');
    });

    it('should return only LEARNED words when bank specified', async () => {
      const words = await useCase.execute('user-1', 'LEARNED');

      expect(Array.isArray(words)).toBe(true);
      expect(words).toHaveLength(1);
      expect((words as StoredWord[])[0].greek).toBe('ευχαριστώ');
    });

    it('should return both banks when no bank specified', async () => {
      const result = await useCase.execute('user-1');

      expect('unknown' in result).toBe(true);
      const allWords = result as { unknown: StoredWord[]; learned: StoredWord[] };
      expect(allWords.unknown).toHaveLength(1);
      expect(allWords.learned).toHaveLength(1);
      expect(allWords.unknown[0].greek).toBe('καλημέρα');
      expect(allWords.learned[0].greek).toBe('ευχαριστώ');
    });

    it('should return empty arrays for user with no words', async () => {
      const result = await useCase.execute('user-no-words');

      const allWords = result as { unknown: StoredWord[]; learned: StoredWord[] };
      expect(allWords.unknown).toHaveLength(0);
      expect(allWords.learned).toHaveLength(0);
    });

    it('should throw ValidationError for empty userId', async () => {
      await expect(useCase.execute('')).rejects.toThrow(ValidationError);
    });
  });

  // ─── MoveWordUseCase ────────────────────────────────────────────────

  describe('MoveWordUseCase', () => {
    let useCase: MoveWordUseCase;

    beforeEach(async () => {
      useCase = new MoveWordUseCase(repository);
      await repository.addWord('user-1', 'UNKNOWN', testWord);
    });

    it('should move a word from UNKNOWN to LEARNED', async () => {
      await useCase.execute('user-1', 'καλημέρα', 'UNKNOWN', 'LEARNED');

      const unknown = await repository.getWords('user-1', 'UNKNOWN');
      const learned = await repository.getWords('user-1', 'LEARNED');

      expect(unknown).toHaveLength(0);
      expect(learned).toHaveLength(1);
      expect(learned[0].greek).toBe('καλημέρα');
      expect(learned[0].english).toBe('good morning');
    });

    it('should move a word from LEARNED to UNKNOWN', async () => {
      // Setup: move to LEARNED first
      await repository.moveWord('user-1', 'UNKNOWN', 'LEARNED', 'καλημέρα');

      await useCase.execute('user-1', 'καλημέρα', 'LEARNED', 'UNKNOWN');

      const unknown = await repository.getWords('user-1', 'UNKNOWN');
      const learned = await repository.getWords('user-1', 'LEARNED');

      expect(unknown).toHaveLength(1);
      expect(learned).toHaveLength(0);
    });

    it('should throw WordNotFoundError for non-existent word', async () => {
      await expect(useCase.execute('user-1', 'nonexistent', 'UNKNOWN', 'LEARNED')).rejects.toThrow(
        WordNotFoundError
      );
    });

    it('should throw ValidationError when fromBank equals toBank', async () => {
      await expect(useCase.execute('user-1', 'καλημέρα', 'UNKNOWN', 'UNKNOWN')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for empty userId', async () => {
      await expect(useCase.execute('', 'καλημέρα', 'UNKNOWN', 'LEARNED')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for empty greek', async () => {
      await expect(useCase.execute('user-1', '', 'UNKNOWN', 'LEARNED')).rejects.toThrow(
        ValidationError
      );
    });
  });
});
