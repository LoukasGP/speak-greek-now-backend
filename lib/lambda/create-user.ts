import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

interface CreateUserRequest {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
  lastLoginAt: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Create user request:', JSON.stringify(event, null, 2));

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'ValidationError',
          message: 'Request body is required',
        }),
      };
    }

    const userData: CreateUserRequest = JSON.parse(event.body);

    if (!userData.userId || !userData.email) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'ValidationError',
          message: 'userId and email are required fields',
        }),
      };
    }

    const userItem = {
      userId: userData.userId,
      email: userData.email,
      name: userData.name || '',
      picture: userData.picture || '',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLoginAt: userData.lastLoginAt || new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: userItem,
        ConditionExpression: 'attribute_not_exists(userId)',
      })
    );

    console.log('User created successfully:', userItem.userId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(userItem),
    };
  } catch (error: any) {
    console.error('Error creating user:', error);

    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'UserAlreadyExists',
          message: 'A user with this userId already exists',
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'InternalServerError',
        message: 'Failed to create user',
      }),
    };
  }
};
