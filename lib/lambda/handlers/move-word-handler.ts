import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBWordBankRepository } from '../adapters/DynamoDBWordBankRepository';
import { MoveWordUseCase } from '../domain/use-cases/WordBankUseCases';
import { Logger } from '../shared/logger';
import { DomainError } from '../shared/errors';

const logger = new Logger('MoveWordHandler');
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Move word request received', {
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

    if (!body.greek || typeof body.greek !== 'string') {
      return createErrorResponse(400, 'greek is required');
    }

    if (!body.from || !['UNKNOWN', 'LEARNED'].includes(body.from)) {
      return createErrorResponse(400, 'from must be "UNKNOWN" or "LEARNED"');
    }

    if (!body.to || !['UNKNOWN', 'LEARNED'].includes(body.to)) {
      return createErrorResponse(400, 'to must be "UNKNOWN" or "LEARNED"');
    }

    const repository = new DynamoDBWordBankRepository(tableName);
    const useCase = new MoveWordUseCase(repository);

    await useCase.execute(userId, body.greek, body.from, body.to);

    logger.info('Word moved successfully', {
      userId,
      greek: body.greek,
      from: body.from,
      to: body.to,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Word moved successfully',
        greek: body.greek,
        from: body.from,
        to: body.to,
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
