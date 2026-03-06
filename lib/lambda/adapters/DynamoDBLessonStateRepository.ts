import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { UserLessonState } from '../domain/entities/activity-types';
import { ILessonStateRepository } from '../domain/ports/ILessonStateRepository';
import { RepositoryError } from '../shared/errors';

export class DynamoDBLessonStateRepository implements ILessonStateRepository {
  private readonly docClient: DynamoDBDocumentClient;

  constructor(
    private readonly tableName: string,
    client?: DynamoDBClient
  ) {
    const dynamoClient = client || new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async getState(userId: string, lessonId: string): Promise<UserLessonState | null> {
    try {
      const result = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            pk: `USER#${userId}`,
            sk: `LESSONSTATE#${lessonId}`,
          },
        })
      );

      if (!result.Item) return null;

      return this.toUserLessonState(result.Item);
    } catch (error) {
      throw new RepositoryError(
        `Failed to get lesson state for user ${userId}, lesson ${lessonId}`,
        error as Error
      );
    }
  }

  async putState(state: UserLessonState): Promise<void> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            pk: `USER#${state.userId}`,
            sk: `LESSONSTATE#${state.lessonId}`,
            gsi1pk: `LESSONSTATE#${state.lessonId}`,
            gsi1sk: `USER#${state.userId}`,
            userId: state.userId,
            lessonId: state.lessonId,
            revealedWords: state.revealedWords,
            sentenceNotes: state.sentenceNotes,
            wordNotes: state.wordNotes,
            comprehensionQuizResults: state.comprehensionQuizResults,
            englishVisible: state.englishVisible,
            sentencesBrokenUp: state.sentencesBrokenUp,
            followAlongEnabled: state.followAlongEnabled,
            lastAccessedAt: state.lastAccessedAt,
          },
        })
      );
    } catch (error) {
      throw new RepositoryError(
        `Failed to save lesson state for user ${state.userId}, lesson ${state.lessonId}`,
        error as Error
      );
    }
  }

  async deleteState(userId: string, lessonId: string): Promise<void> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: {
            pk: `USER#${userId}`,
            sk: `LESSONSTATE#${lessonId}`,
          },
        })
      );
    } catch (error) {
      throw new RepositoryError(
        `Failed to delete lesson state for user ${userId}, lesson ${lessonId}`,
        error as Error
      );
    }
  }

  private toUserLessonState(item: Record<string, any>): UserLessonState {
    return {
      userId: item.userId,
      lessonId: item.lessonId,
      revealedWords: item.revealedWords ?? [],
      sentenceNotes: item.sentenceNotes ?? [],
      wordNotes: item.wordNotes ?? [],
      comprehensionQuizResults: item.comprehensionQuizResults ?? [],
      englishVisible: item.englishVisible ?? true,
      sentencesBrokenUp: item.sentencesBrokenUp ?? false,
      followAlongEnabled: item.followAlongEnabled ?? false,
      lastAccessedAt: item.lastAccessedAt ?? new Date().toISOString(),
    };
  }
}
