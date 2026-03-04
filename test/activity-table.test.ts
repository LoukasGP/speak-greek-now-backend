import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ActivityTableStack } from '../lib/activity-table-service';

describe('ActivityTableStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new ActivityTableStack(app, 'TestActivityTableStack', {
      environment: 'dev',
      envSuffix: '-dev',
    });
    template = Template.fromStack(stack);
  });

  test('creates DynamoDB table with correct key schema', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
    });
  });

  test('table has correct name with environment suffix', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      TableName: 'speak-greek-now-activity-dev',
    });
  });

  test('table uses PAY_PER_REQUEST billing mode', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('table uses DynamoDB-owned encryption (default)', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      SSESpecification: {
        SSEEnabled: false,
      },
    });
  });

  test('table has point-in-time recovery enabled', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      Replicas: [
        {
          PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: true,
          },
          Region: { Ref: 'AWS::Region' },
        },
      ],
    });
  });

  test('table has RETAIN removal policy', () => {
    template.hasResource('AWS::DynamoDB::GlobalTable', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
    });
  });

  test('GSI gsi1-index exists with correct keys', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      GlobalSecondaryIndexes: [
        {
          IndexName: 'gsi1-index',
          KeySchema: [
            { AttributeName: 'gsi1pk', KeyType: 'HASH' },
            { AttributeName: 'gsi1sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        },
      ],
    });
  });

  test('table defines all required attribute definitions', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
        { AttributeName: 'gsi1pk', AttributeType: 'S' },
        { AttributeName: 'gsi1sk', AttributeType: 'S' },
      ],
    });
  });

  test('stack exports ActivityTableName', () => {
    template.hasOutput('ActivityTableName', {
      Export: { Name: 'ActivityTableName-dev' },
    });
  });

  test('stack exports ActivityTableArn', () => {
    template.hasOutput('ActivityTableArn', {
      Export: { Name: 'ActivityTableArn-dev' },
    });
  });

  describe('production configuration', () => {
    let prodTemplate: Template;

    beforeAll(() => {
      const app = new cdk.App();
      const stack = new ActivityTableStack(app, 'ProdActivityTableStack', {
        environment: 'prod',
        envSuffix: '',
      });
      prodTemplate = Template.fromStack(stack);
    });

    test('production table has no suffix', () => {
      prodTemplate.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
        TableName: 'speak-greek-now-activity',
      });
    });

    test('production exports have no suffix', () => {
      prodTemplate.hasOutput('ActivityTableName', {
        Export: { Name: 'ActivityTableName' },
      });
    });
  });
});
