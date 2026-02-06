import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { User, CompletedLesson } from '../domain/entities/User';
import { IUserRepository } from '../domain/ports/IUserRepository';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
  RepositoryError,
} from '../shared/errors';

export class DynamoDBUserRepository implements IUserRepository {
  private readonly docClient: DynamoDBDocumentClient;

  constructor(
    private readonly tableName: string,
    client?: DynamoDBClient
  ) {
    const dynamoClient = client || new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { userId },
        })
      );

      return result.Item ? this.fromDynamoDBItem(result.Item) : null;
    } catch (error: any) {
      throw new RepositoryError(
        `Failed to get user ${userId}`,
        error as Error
      );
    }
  }

  async createUser(user: User): Promise<User> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: this.toDynamoDBItem(user),
          ConditionExpression: 'attribute_not_exists(userId)',
        })
      );

      return user;
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new UserAlreadyExistsError(user.userId);
      }
      throw new RepositoryError(
        `Failed to create user ${user.userId}`,
        error as Error
      );
    }
  }

  async updateUser(user: User): Promise<User> {
    try {
      const updateExpression: string[] = [];
      const expressionAttributeValues: Record<string, any> = {};

      updateExpression.push('lastLoginAt = :lastLoginAt');
      expressionAttributeValues[':lastLoginAt'] = user.lastLoginAt.toISOString();

      if (user.completedLessons && user.completedLessons.length > 0) {
        updateExpression.push('completedLessons = :completedLessons');
        expressionAttributeValues[':completedLessons'] = user.completedLessons;
      } else {
        updateExpression.push('completedLessons = :emptyList');
        expressionAttributeValues[':emptyList'] = [];
      }

      const params: UpdateCommandInput = {
        TableName: this.tableName,
        Key: { userId: user.userId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(userId)',
        ReturnValues: 'ALL_NEW',
      };

      const result = await this.docClient.send(new UpdateCommand(params));

      if (!result.Attributes) {
        throw new RepositoryError(`Update returned no attributes for user ${user.userId}`);
      }

      return this.fromDynamoDBItem(result.Attributes);
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new UserNotFoundError(user.userId);
      }
      throw new RepositoryError(
        `Failed to update user ${user.userId}`,
        error as Error
      );
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.docClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { userId },
          UpdateExpression: 'SET lastLoginAt = :lastLoginAt',
          ExpressionAttributeValues: {
            ':lastLoginAt': new Date().toISOString(),
          },
          ConditionExpression: 'attribute_exists(userId)',
        })
      );
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new UserNotFoundError(userId);
      }
      throw new RepositoryError(
        `Failed to update last login for user ${userId}`,
        error as Error
      );
    }
  }

  async userExists(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user !== null;
  }

  private toDynamoDBItem(user: User): Record<string, any> {
    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt.toISOString(),
      completedLessons: user.completedLessons || [],
    };
  }

  private fromDynamoDBItem(item: any): User {
    return new User(
      item.userId,
      item.email,
      item.name,
      item.picture || '',
      new Date(item.createdAt),
      new Date(item.lastLoginAt),
      item.completedLessons || []
    );
  }
}
