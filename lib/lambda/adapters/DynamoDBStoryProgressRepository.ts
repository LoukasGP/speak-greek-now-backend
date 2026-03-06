import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { StoryProgress } from '../domain/entities/StoryProgress';
import { IStoryProgressRepository } from '../domain/ports/IStoryProgressRepository';
import { RepositoryError } from '../shared/errors';
import { Logger } from '../shared/logger';

const logger = new Logger('DynamoDBStoryProgressRepository');

export class DynamoDBStoryProgressRepository implements IStoryProgressRepository {
  private readonly docClient: DynamoDBDocumentClient;

  constructor(
    private readonly tableName: string,
    client?: DynamoDBClient
  ) {
    const dynamoClient = client || new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async getProgress(userId: string, storyId: string): Promise<StoryProgress | null> {
    try {
      const result = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { userId, storyId },
        })
      );

      return result.Item ? this.fromDynamoDBItem(result.Item) : null;
    } catch (error: any) {
      logger.error('Failed to get story progress', error, { userId, storyId });
      throw new RepositoryError(
        `Failed to get story progress for user ${userId} story ${storyId}`,
        error as Error
      );
    }
  }

  async saveProgress(progress: StoryProgress): Promise<void> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: this.toDynamoDBItem(progress),
        })
      );
    } catch (error: any) {
      logger.error('Failed to save story progress', error, {
        userId: progress.userId,
        storyId: progress.storyId,
      });
      throw new RepositoryError(
        `Failed to save story progress for user ${progress.userId} story ${progress.storyId}`,
        error as Error
      );
    }
  }

  async getProgressByUser(userId: string): Promise<StoryProgress[]> {
    try {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
        })
      );

      return (result.Items || []).map((item) => this.fromDynamoDBItem(item));
    } catch (error: any) {
      logger.error('Failed to get story progress by user', error, { userId });
      throw new RepositoryError(
        `Failed to get story progress for user ${userId}`,
        error as Error
      );
    }
  }

  private toDynamoDBItem(progress: StoryProgress): Record<string, any> {
    return {
      userId: progress.userId,
      storyId: progress.storyId,
      currentCheckpointId: progress.currentCheckpointId,
      checkpointsCompleted: progress.checkpointsCompleted.map((c) => ({
        checkpointId: c.checkpointId,
        completedAt: c.completedAt,
      })),
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
    };
  }

  private fromDynamoDBItem(item: Record<string, any>): StoryProgress {
    if (!item.userId || !item.storyId) {
      throw new RepositoryError('Corrupted data: missing required keys userId or storyId');
    }
    if (!item.currentCheckpointId) {
      throw new RepositoryError('Corrupted data: missing currentCheckpointId');
    }

    return new StoryProgress(
      item.userId,
      item.storyId,
      item.currentCheckpointId,
      item.checkpointsCompleted || [],
      item.startedAt,
      item.completedAt ?? null
    );
  }
}
