import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBWordBankRepository } from '../adapters/DynamoDBWordBankRepository';
import { GetWordsUseCase } from '../domain/use-cases/WordBankUseCases';
import { Logger } from '../shared/logger';
import { DomainError } from '../shared/errors';

const logger = new Logger('GetWordsHandler');
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Get words request received', {
    requestId: event.requestContext.requestId,
  });

  try {
    const encodedUserId = event.pathParameters?.userId;

    if (!encodedUserId) {
      return createErrorResponse(400, 'userId path parameter is required');
    }

    const userId = decodeURIComponent(encodedUserId);

    const repository = new DynamoDBWordBankRepository(tableName);
    const useCase = new GetWordsUseCase(repository);

    const result = await useCase.execute(userId);

    const body =
      'unknown' in result
        ? {
            wordsIDoNotKnow: result.unknown,
            wordsIHaveLearned: result.learned,
          }
        : result;

    logger.info('Words retrieved successfully', { userId });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(body),
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
