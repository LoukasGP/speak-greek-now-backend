import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { StoredWord } from '../domain/entities/activity-types';
import { IWordBankRepository, WordBank } from '../domain/ports/IWordBankRepository';
import { WordNotFoundError, RepositoryError } from '../shared/errors';

export class DynamoDBWordBankRepository implements IWordBankRepository {
  private readonly docClient: DynamoDBDocumentClient;

  constructor(
    private readonly tableName: string,
    client?: DynamoDBClient
  ) {
    const dynamoClient = client || new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async addWord(userId: string, bank: WordBank, word: StoredWord): Promise<void> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            pk: `USER#${userId}`,
            sk: `WORD#${bank}#${word.greek}`,
            greek: word.greek,
            english: word.english,
            lessonId: word.lessonId,
            addedAt: word.addedAt,
          },
        })
      );
    } catch (error) {
      throw new RepositoryError(
        `Failed to add word "${word.greek}" for user ${userId}`,
        error as Error
      );
    }
  }

  async removeWord(userId: string, bank: WordBank, greek: string): Promise<void> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: {
            pk: `USER#${userId}`,
            sk: `WORD#${bank}#${greek}`,
          },
        })
      );
    } catch (error) {
      throw new RepositoryError(
        `Failed to remove word "${greek}" for user ${userId}`,
        error as Error
      );
    }
  }

  async getWords(userId: string, bank: WordBank): Promise<StoredWord[]> {
    try {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':skPrefix': `WORD#${bank}#`,
          },
        })
      );

      return (result.Items || []).map(this.toStoredWord);
    } catch (error) {
      throw new RepositoryError(`Failed to get ${bank} words for user ${userId}`, error as Error);
    }
  }

  async getAllWords(userId: string): Promise<{ unknown: StoredWord[]; learned: StoredWord[] }> {
    try {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':skPrefix': 'WORD#',
          },
        })
      );

      const unknown: StoredWord[] = [];
      const learned: StoredWord[] = [];

      for (const item of result.Items || []) {
        const sk = item.sk as string;
        const word = this.toStoredWord(item);

        if (sk.startsWith('WORD#UNKNOWN#')) {
          unknown.push(word);
        } else if (sk.startsWith('WORD#LEARNED#')) {
          learned.push(word);
        }
      }

      return { unknown, learned };
    } catch (error) {
      throw new RepositoryError(`Failed to get all words for user ${userId}`, error as Error);
    }
  }

  async moveWord(
    userId: string,
    fromBank: WordBank,
    toBank: WordBank,
    greek: string
  ): Promise<void> {
    const pk = `USER#${userId}`;
    const sourceSk = `WORD#${fromBank}#${greek}`;
    const targetSk = `WORD#${toBank}#${greek}`;

    // First read the source word to get its full data
    const existing = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { pk, sk: sourceSk },
      })
    );

    if (!existing.Item) {
      throw new WordNotFoundError(greek, fromBank);
    }

    try {
      await this.docClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Delete: {
                TableName: this.tableName,
                Key: { pk, sk: sourceSk },
                ConditionExpression: 'attribute_exists(pk)',
              },
            },
            {
              Put: {
                TableName: this.tableName,
                Item: {
                  pk,
                  sk: targetSk,
                  greek: existing.Item.greek,
                  english: existing.Item.english,
                  lessonId: existing.Item.lessonId,
                  addedAt: existing.Item.addedAt,
                },
              },
            },
          ],
        })
      );
    } catch (error) {
      throw new RepositoryError(
        `Failed to move word "${greek}" from ${fromBank} to ${toBank}`,
        error as Error
      );
    }
  }

  async hasWord(userId: string, bank: WordBank, greek: string): Promise<boolean> {
    try {
      const result = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            pk: `USER#${userId}`,
            sk: `WORD#${bank}#${greek}`,
          },
        })
      );

      return !!result.Item;
    } catch (error) {
      throw new RepositoryError(
        `Failed to check word "${greek}" for user ${userId}`,
        error as Error
      );
    }
  }

  private toStoredWord(item: Record<string, any>): StoredWord {
    return {
      greek: item.greek,
      english: item.english,
      lessonId: item.lessonId,
      addedAt: item.addedAt,
    };
  }
}
