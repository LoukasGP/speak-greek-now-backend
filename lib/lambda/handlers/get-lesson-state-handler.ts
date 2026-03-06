import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBLessonStateRepository } from '../adapters/DynamoDBLessonStateRepository';
import { GetLessonStateUseCase } from '../domain/use-cases/LessonStateUseCases';
import { Logger } from '../shared/logger';
import { DomainError } from '../shared/errors';

const logger = new Logger('GetLessonStateHandler');
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Get lesson state request received', {
    requestId: event.requestContext.requestId,
  });

  try {
    const encodedUserId = event.pathParameters?.userId;
    const lessonId = event.pathParameters?.lessonId;

    if (!encodedUserId) {
      return createErrorResponse(400, 'userId path parameter is required');
    }
    if (!lessonId) {
      return createErrorResponse(400, 'lessonId path parameter is required');
    }

    const userId = decodeURIComponent(encodedUserId);

    const repository = new DynamoDBLessonStateRepository(tableName);
    const useCase = new GetLessonStateUseCase(repository);

    const state = await useCase.execute(userId, lessonId);

    if (!state) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(null),
      };
    }

    logger.info('Lesson state retrieved successfully', { userId, lessonId });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(state),
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
      error: {
        code: code || 'BAD_REQUEST',
        message,
      },
    }),
  };
}
