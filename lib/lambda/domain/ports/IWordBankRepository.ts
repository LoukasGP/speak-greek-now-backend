import { StoredWord } from '../entities/activity-types';

export type WordBank = 'UNKNOWN' | 'LEARNED';

export interface IWordBankRepository {
  addWord(userId: string, bank: WordBank, word: StoredWord): Promise<void>;
  removeWord(userId: string, bank: WordBank, greek: string): Promise<void>;
  getWords(userId: string, bank: WordBank): Promise<StoredWord[]>;
  getAllWords(userId: string): Promise<{ unknown: StoredWord[]; learned: StoredWord[] }>;
  moveWord(userId: string, fromBank: WordBank, toBank: WordBank, greek: string): Promise<void>;
  hasWord(userId: string, bank: WordBank, greek: string): Promise<boolean>;
}
