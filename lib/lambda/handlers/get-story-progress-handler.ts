import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBStoryProgressRepository } from '../adapters/DynamoDBStoryProgressRepository';
import { GetStoryProgressUseCase } from '../domain/use-cases/GetStoryProgressUseCase';
import { Logger } from '../shared/logger';
import { DomainError } from '../shared/errors';

const logger = new Logger('GetStoryProgressHandler');
const tableName = process.env.STORY_PROGRESS_TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Get story progress request received', {
    requestId: event.requestContext.requestId,
  });

  try {
    const encodedStoryId = event.pathParameters?.storyId;
    const encodedUserId = event.pathParameters?.userId;

    if (!encodedStoryId) {
      return createErrorResponse(400, 'storyId path parameter is required');
    }
    if (!encodedUserId) {
      return createErrorResponse(400, 'userId path parameter is required');
    }

    const storyId = decodeURIComponent(encodedStoryId);
    const userId = decodeURIComponent(encodedUserId);

    const repository = new DynamoDBStoryProgressRepository(tableName);
    const useCase = new GetStoryProgressUseCase(repository);

    const progress = await useCase.execute(userId, storyId);

    logger.info('Story progress retrieved successfully', { userId, storyId });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(progress.toJSON()),
    };
  } catch (error) {
    return handleError(error);
  }
};

function handleError(error: unknown): APIGatewayProxyResult {
  if (error instanceof DomainError) {
    logger.warn('Domain error occurred', {
      code: error.code,
      message: error.message,
    });

    return createErrorResponse(error.statusCode, error.message, error.code);
  }

  logger.error('Unexpected error occurred', error as Error);

  return createErrorResponse(500, 'An internal server error occurred', 'INTERNAL_SERVER_ERROR');
}

function createErrorResponse(
  statusCode: number,
  message: string,
  code?: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      error: code || 'ERROR',
      message,
    }),
  };
}
