import { APIGatewayClient, GetApiKeyCommand } from '@aws-sdk/client-api-gateway';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

type TestConfig = {
  apiUrl: string;
  apiKey: string;
};

type Output = {
  OutputKey?: string;
  OutputValue?: string;
};

const stackName = 'SpeakHellenic-UserLoginServiceStack-dev';

async function loadTestConfig(): Promise<TestConfig> {
  const cloudFormation = new CloudFormationClient({});
  let outputs: Output[] | undefined;

  try {
    const stackResponse = await cloudFormation.send(
      new DescribeStacksCommand({
        StackName: stackName,
      })
    );

    outputs = stackResponse.Stacks?.[0]?.Outputs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Unable to load stack outputs for ${stackName}. Ensure the dev stack is deployed and your AWS credentials are configured. Original error: ${errorMessage}`
    );
  }

  if (!outputs) {
    throw new Error(`Stack outputs not found for ${stackName}.`);
  }

  const apiUrl = requireOutputValue(outputs, 'UserApiUrl');
  const apiKeyId = requireOutputValue(outputs, 'UserApiKeyId');

  const apiGateway = new APIGatewayClient({});
  const apiKeyResponse = await apiGateway.send(
    new GetApiKeyCommand({
      apiKey: apiKeyId,
      includeValue: true,
    })
  );

  if (!apiKeyResponse.value) {
    throw new Error(`API key value not found for key ID ${apiKeyId}.`);
  }

  return {
    apiUrl: apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl,
    apiKey: apiKeyResponse.value,
  };
}

function requireOutputValue(outputs: Output[], key: string): string {
  const match = outputs.find((output) => output.OutputKey === key)?.OutputValue;

  if (!match) {
    throw new Error(`Required CloudFormation output ${key} was not found.`);
  }

  return match;
}

async function requestJson(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  apiKey: string,
  body?: Record<string, unknown>
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('User Login API E2E (dev)', () => {
  let config: TestConfig | null = null;
  let createdUserId: string | null = null;

  jest.setTimeout(30000);

  beforeAll(async () => {
    config = await loadTestConfig();
  });

  afterAll(async () => {
    if (config && createdUserId) {
      await requestJson(
        'DELETE',
        `${config.apiUrl}/users/${encodeURIComponent(createdUserId)}`,
        config.apiKey
      );
    }
  });

  test('creates, reads, and updates a user', async () => {
    if (!config) {
      throw new Error('Test configuration was not loaded.');
    }

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userId = `test-e2e-${suffix}`;
    const createdAt = new Date().toISOString();

    const createPayload = {
      userId,
      email: `e2e-${suffix}@example.com`,
      name: 'E2E Test User',
      picture: 'https://example.com/e2e-user.png',
      createdAt,
      lastLoginAt: createdAt,
    };

    const createResponse = await requestJson(
      'POST',
      `${config.apiUrl}/users`,
      config.apiKey,
      createPayload
    );

    expect(createResponse.status).toBe(200);
    const createBody = (await createResponse.json()) as typeof createPayload;

    expect(createBody.userId).toBe(createPayload.userId);
    expect(createBody.email).toBe(createPayload.email);
    expect(createBody.name).toBe(createPayload.name);
    expect(createBody.picture).toBe(createPayload.picture);
    expect(createBody.createdAt).toBe(createPayload.createdAt);
    expect(createBody.lastLoginAt).toBe(createPayload.lastLoginAt);

    createdUserId = userId;

    const getResponse = await requestJson(
      'GET',
      `${config.apiUrl}/users/${encodeURIComponent(userId)}`,
      config.apiKey
    );

    expect(getResponse.status).toBe(200);
    const getBody = (await getResponse.json()) as typeof createPayload;

    expect(getBody.userId).toBe(createPayload.userId);
    expect(getBody.email).toBe(createPayload.email);
    expect(getBody.name).toBe(createPayload.name);
    expect(getBody.picture).toBe(createPayload.picture);

    const updatedLastLoginAt = new Date(Date.now() + 1000).toISOString();
    const updateResponse = await requestJson(
      'PUT',
      `${config.apiUrl}/users/${encodeURIComponent(userId)}`,
      config.apiKey,
      {
        lastLoginAt: updatedLastLoginAt,
      }
    );

    expect(updateResponse.status).toBe(200);
    const updateBody = (await updateResponse.json()) as typeof createPayload;

    expect(updateBody.userId).toBe(createPayload.userId);
    expect(updateBody.lastLoginAt).toBe(updatedLastLoginAt);
  });

  test('deletes a user', async () => {
    if (!config) {
      throw new Error('Test configuration was not loaded.');
    }

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userId = `test-e2e-delete-${suffix}`;
    const createdAt = new Date().toISOString();

    const createPayload = {
      userId,
      email: `e2e-delete-${suffix}@example.com`,
      name: 'E2E Delete Test User',
      picture: 'https://example.com/e2e-delete-user.png',
      createdAt,
      lastLoginAt: createdAt,
    };

    await requestJson('POST', `${config.apiUrl}/users`, config.apiKey, createPayload);

    const deleteResponse = await requestJson(
      'DELETE',
      `${config.apiUrl}/users/${encodeURIComponent(userId)}`,
      config.apiKey
    );

    expect(deleteResponse.status).toBe(204);

    const getResponse = await requestJson(
      'GET',
      `${config.apiUrl}/users/${encodeURIComponent(userId)}`,
      config.apiKey
    );

    expect(getResponse.status).toBe(404);
  });
});
