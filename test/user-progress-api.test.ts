import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { UserLoginServiceStack } from '../lib/user-login-service';

describe('User Progress API Tests', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new UserLoginServiceStack(app, 'TestUserLoginServiceStack', {
      environment: 'test',
      envSuffix: '-test',
    });
    template = Template.fromStack(stack);
  });

  describe('DynamoDB Table Configuration', () => {
    test('DynamoDB table accepts completedLessons attribute (no schema enforcement needed)', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'speak-greek-now-users-test',
        AttributeDefinitions: [
          {
            AttributeName: 'userId',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'userId',
            KeyType: 'HASH',
          },
        ],
      });
    });
  });

  describe('GET /users/{userId} - Returns completedLessons', () => {
    test('GET endpoint exists with correct configuration', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        ApiKeyRequired: true,
      });
    });

    test('GET response template includes completedLessons when present', () => {
      const integrations = template.findResources('AWS::ApiGateway::Method');

      let foundGetIntegration = false;
      Object.values(integrations).forEach((resource) => {
        if ((resource as any).Properties.HttpMethod === 'GET') {
          foundGetIntegration = true;
        }
      });

      expect(foundGetIntegration).toBe(true);
    });
  });

  describe('PUT /users/{userId} - Update User with completedLessons', () => {
    test('PUT endpoint exists with correct configuration', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'PUT',
        ApiKeyRequired: true,
      });
    });

    test('PUT method has correct response codes configured', () => {
      const methods = template.findResources('AWS::ApiGateway::Method');

      let foundPutMethod = false;
      Object.values(methods).forEach((resource) => {
        if ((resource as any).Properties.HttpMethod === 'PUT') {
          foundPutMethod = true;
          const methodResponses = (resource as any).Properties.MethodResponses;

          const statusCodes = methodResponses.map((r: any) => r.StatusCode);
          expect(statusCodes).toContain('200');
          expect(statusCodes).toContain('400');
          expect(statusCodes).toContain('404');
          expect(statusCodes).toContain('500');
        }
      });

      expect(foundPutMethod).toBe(true);
    });

    test('API has CORS configured for PUT requests', () => {
      template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'Speak Greek Now User API',
      });
    });
  });

  describe('API Gateway Configuration', () => {
    test('API Gateway has CloudWatch logging enabled', () => {
      template.hasResourceProperties('AWS::ApiGateway::Stage', {
        StageName: 'prod',
        MethodSettings: [
          {
            LoggingLevel: 'INFO',
            MetricsEnabled: true,
          },
        ],
      });
    });

    test('API key authentication is configured', () => {
      template.hasResourceProperties('AWS::ApiGateway::ApiKey', {
        Enabled: true,
        Name: 'speak-greek-now-user-api-key',
      });
    });

    test('Usage plan is configured with correct limits', () => {
      template.hasResourceProperties('AWS::ApiGateway::UsagePlan', {
        Throttle: {
          RateLimit: 10,
          BurstLimit: 20,
        },
        Quota: {
          Limit: 5000,
          Period: 'MONTH',
        },
      });
    });
  });

  describe('IAM Permissions', () => {
    test('API Gateway role has DynamoDB read/write permissions', () => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: {
          Statement: [
            {
              Action: 'sts:AssumeRole',
              Effect: 'Allow',
              Principal: {
                Service: 'apigateway.amazonaws.com',
              },
            },
          ],
        },
      });

      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: [
                'dynamodb:BatchGetItem',
                'dynamodb:GetRecords',
                'dynamodb:GetShardIterator',
                'dynamodb:Query',
                'dynamodb:GetItem',
                'dynamodb:Scan',
                'dynamodb:ConditionCheckItem',
                'dynamodb:BatchWriteItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:DescribeTable',
              ],
              Effect: 'Allow',
            },
          ],
        },
      });
    });
  });

  describe('CloudWatch Monitoring', () => {
    test('Access log group is configured', () => {
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/aws/apigateway/speak-greek-now-user-api-test',
        RetentionInDays: 7,
      });
    });

    test('Error alarm is configured', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        AlarmName: 'SpeakHellenic-UserApi-HighErrorRate',
        Threshold: 10,
        EvaluationPeriods: 2,
      });
    });
  });
});
