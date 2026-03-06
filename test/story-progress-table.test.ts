import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { UserLoginServiceStack } from '../lib/user-login-service';
import { ActivityTableStack } from '../lib/activity-table-service';

describe('Story Progress Table CDK Tests', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const activityStack = new ActivityTableStack(app, 'TestActivityStack-SP', {
      environment: 'test',
      envSuffix: '-test',
    });
    const stack = new UserLoginServiceStack(app, 'TestUserLoginStack-SP', {
      environment: 'test',
      envSuffix: '-test',
      getWordsFunction: activityStack.getWordsFunction,
      putWordsFunction: activityStack.putWordsFunction,
      moveWordFunction: activityStack.moveWordFunction,
    });
    template = Template.fromStack(stack);
  });

  describe('DynamoDB Table', () => {
    test('table exists with correct name pattern', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'speak-greek-now-story-progress-test',
      });
    });

    test('partition key is userId (String)', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'speak-greek-now-story-progress-test',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'storyId', KeyType: 'RANGE' },
        ],
      });
    });

    test('sort key is storyId (String)', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'speak-greek-now-story-progress-test',
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'storyId', AttributeType: 'S' },
        ],
      });
    });

    test('billing mode is PAY_PER_REQUEST', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'speak-greek-now-story-progress-test',
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    test('point-in-time recovery is enabled', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'speak-greek-now-story-progress-test',
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true,
        },
      });
    });

    test('GSI storyId-index exists with storyId as partition key', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'speak-greek-now-story-progress-test',
        GlobalSecondaryIndexes: [
          {
            IndexName: 'storyId-index',
            KeySchema: [{ AttributeName: 'storyId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
      });
    });
  });

  describe('Lambda Functions', () => {
    test('get-story-progress Lambda function exists', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'speak-greek-now-get-story-progress-test',
        Runtime: 'nodejs20.x',
        MemorySize: 256,
        Timeout: 10,
      });
    });

    test('update-story-progress Lambda function exists', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'speak-greek-now-update-story-progress-test',
        Runtime: 'nodejs20.x',
        MemorySize: 256,
        Timeout: 10,
      });
    });

    test('get-user-stories Lambda function exists', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'speak-greek-now-get-user-stories-test',
        Runtime: 'nodejs20.x',
        MemorySize: 256,
        Timeout: 10,
      });
    });
  });

  describe('API Gateway Routes', () => {
    test('stories resource exists', () => {
      template.hasResourceProperties('AWS::ApiGateway::Resource', {
        PathPart: 'stories',
      });
    });

    test('storyId resource exists', () => {
      template.hasResourceProperties('AWS::ApiGateway::Resource', {
        PathPart: '{storyId}',
      });
    });

    test('progress resource exists', () => {
      template.hasResourceProperties('AWS::ApiGateway::Resource', {
        PathPart: 'progress',
      });
    });
  });

  describe('CloudFormation Outputs', () => {
    test('StoryProgressTableName output exists', () => {
      template.hasOutput('StoryProgressTableName', {});
    });

    test('StoryProgressTableArn output exists', () => {
      template.hasOutput('StoryProgressTableArn', {});
    });
  });

  describe('Tags', () => {
    test('story progress table has correct tags', () => {
      const tables = template.findResources('AWS::DynamoDB::Table', {
        Properties: {
          TableName: 'speak-greek-now-story-progress-test',
        },
      });

      const tableKey = Object.keys(tables)[0];
      expect(tableKey).toBeDefined();

      const tags = tables[tableKey].Properties.Tags;
      const tagMap: Record<string, string> = {};
      for (const tag of tags) {
        tagMap[tag.Key] = tag.Value;
      }

      expect(tagMap['Project']).toBe('SpeakHellenic');
      expect(tagMap['Environment']).toBe('test');
      expect(tagMap['ManagedBy']).toBe('CDK');
      expect(tagMap['Feature']).toBe('Stories');
    });
  });
});
