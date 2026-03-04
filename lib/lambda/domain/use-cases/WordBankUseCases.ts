import { StoredWord } from '../entities/activity-types';
import { IWordBankRepository, WordBank } from '../ports/IWordBankRepository';
import { ValidationError } from '../../shared/errors';

export class AddWordUseCase {
  constructor(private readonly repository: IWordBankRepository) {}

  async execute(userId: string, bank: WordBank, word: StoredWord): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }
    if (!word.greek || word.greek.trim().length === 0) {
      throw new ValidationError('greek is required');
    }
    if (!word.english || word.english.trim().length === 0) {
      throw new ValidationError('english is required');
    }
    if (!word.lessonId || word.lessonId.trim().length === 0) {
      throw new ValidationError('lessonId is required');
    }

    const trimmedWord: StoredWord = {
      greek: word.greek.trim(),
      english: word.english,
      lessonId: word.lessonId,
      addedAt: word.addedAt,
    };

    await this.repository.addWord(userId, bank, trimmedWord);
  }
}

export class RemoveWordUseCase {
  constructor(private readonly repository: IWordBankRepository) {}

  async execute(userId: string, bank: WordBank, greek: string): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }
    if (!greek || greek.trim().length === 0) {
      throw new ValidationError('greek is required');
    }

    await this.repository.removeWord(userId, bank, greek);
  }
}

export class GetWordsUseCase {
  constructor(private readonly repository: IWordBankRepository) {}

  async execute(
    userId: string,
    bank?: WordBank
  ): Promise<StoredWord[] | { unknown: StoredWord[]; learned: StoredWord[] }> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }

    if (bank) {
      return this.repository.getWords(userId, bank);
    }

    return this.repository.getAllWords(userId);
  }
}

export class MoveWordUseCase {
  constructor(private readonly repository: IWordBankRepository) {}

  async execute(
    userId: string,
    greek: string,
    fromBank: WordBank,
    toBank: WordBank
  ): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }
    if (!greek || greek.trim().length === 0) {
      throw new ValidationError('greek is required');
    }
    if (fromBank === toBank) {
      throw new ValidationError('fromBank and toBank must be different');
    }

    await this.repository.moveWord(userId, fromBank, toBank, greek);
  }
}
