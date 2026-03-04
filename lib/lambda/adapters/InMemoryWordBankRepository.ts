import { StoredWord } from '../domain/entities/activity-types';
import { IWordBankRepository, WordBank } from '../domain/ports/IWordBankRepository';
import { WordNotFoundError } from '../shared/errors';

export class InMemoryWordBankRepository implements IWordBankRepository {
  private words: Map<string, StoredWord> = new Map();

  private key(userId: string, bank: WordBank, greek: string): string {
    return `${userId}#WORD#${bank}#${greek}`;
  }

  async addWord(userId: string, bank: WordBank, word: StoredWord): Promise<void> {
    this.words.set(this.key(userId, bank, word.greek), word);
  }

  async removeWord(userId: string, bank: WordBank, greek: string): Promise<void> {
    this.words.delete(this.key(userId, bank, greek));
  }

  async getWords(userId: string, bank: WordBank): Promise<StoredWord[]> {
    const prefix = `${userId}#WORD#${bank}#`;
    const result: StoredWord[] = [];

    for (const [key, word] of this.words) {
      if (key.startsWith(prefix)) {
        result.push(word);
      }
    }

    return result;
  }

  async getAllWords(userId: string): Promise<{ unknown: StoredWord[]; learned: StoredWord[] }> {
    const unknown = await this.getWords(userId, 'UNKNOWN');
    const learned = await this.getWords(userId, 'LEARNED');
    return { unknown, learned };
  }

  async moveWord(
    userId: string,
    fromBank: WordBank,
    toBank: WordBank,
    greek: string
  ): Promise<void> {
    const sourceKey = this.key(userId, fromBank, greek);
    const word = this.words.get(sourceKey);

    if (!word) {
      throw new WordNotFoundError(greek, fromBank);
    }

    this.words.delete(sourceKey);
    this.words.set(this.key(userId, toBank, greek), word);
  }

  async hasWord(userId: string, bank: WordBank, greek: string): Promise<boolean> {
    return this.words.has(this.key(userId, bank, greek));
  }

  clear(): void {
    this.words.clear();
  }

  count(): number {
    return this.words.size;
  }
}
