import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBWordBankRepository } from '../adapters/DynamoDBWordBankRepository';
import { AddWordUseCase } from '../domain/use-cases/WordBankUseCases';
import { Logger } from '../shared/logger';
import { DomainError } from '../shared/errors';
import { StoredWord } from '../domain/entities/activity-types';

const logger = new Logger('PutWordsHandler');
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Put words request received', {
    requestId: event.requestContext.requestId,
  });

  try {
    const encodedUserId = event.pathParameters?.userId;

    if (!encodedUserId) {
      return createErrorResponse(400, 'userId path parameter is required');
    }

    const userId = decodeURIComponent(encodedUserId);

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const body = JSON.parse(event.body);

    if (!body.words || !Array.isArray(body.words)) {
      return createErrorResponse(400, 'words array is required');
    }

    if (!body.bank || !['UNKNOWN', 'LEARNED'].includes(body.bank)) {
      return createErrorResponse(400, 'bank must be "UNKNOWN" or "LEARNED"');
    }

    const repository = new DynamoDBWordBankRepository(tableName);
    const useCase = new AddWordUseCase(repository);

    const words: StoredWord[] = body.words;

    for (const word of words) {
      await useCase.execute(userId, body.bank, word);
    }

    logger.info('Words added successfully', { userId, count: words.length });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Words added successfully',
        count: words.length,
      }),
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
