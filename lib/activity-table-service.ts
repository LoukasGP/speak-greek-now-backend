import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface ActivityTableStackProps extends cdk.StackProps {
  environment: string;
  envSuffix: string;
}

export class ActivityTableStack extends cdk.Stack {
  public readonly table: dynamodb.TableV2;
  public readonly getWordsFunction: lambdaNodejs.NodejsFunction;
  public readonly putWordsFunction: lambdaNodejs.NodejsFunction;
  public readonly moveWordFunction: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: ActivityTableStackProps) {
    super(scope, id, props);

    this.table = new dynamodb.TableV2(this, 'ActivityTable', {
      tableName: `speak-greek-now-activity${props.envSuffix}`,
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING,
      },
      billing: dynamodb.Billing.onDemand(),
      encryption: dynamodb.TableEncryptionV2.dynamoOwnedKey(),
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      globalSecondaryIndexes: [
        {
          indexName: 'gsi1-index',
          partitionKey: {
            name: 'gsi1pk',
            type: dynamodb.AttributeType.STRING,
          },
          sortKey: {
            name: 'gsi1sk',
            type: dynamodb.AttributeType.STRING,
          },
        },
      ],
    });

    cdk.Tags.of(this.table).add('Project', 'SpeakHellenic');
    cdk.Tags.of(this.table).add('Environment', props.environment);
    cdk.Tags.of(this.table).add('Component', 'ActivityData');

    new cdk.CfnOutput(this, 'ActivityTableName', {
      value: this.table.tableName,
      description: 'Name of the Activity DynamoDB table',
      exportName: `ActivityTableName${props.envSuffix}`,
    });

    new cdk.CfnOutput(this, 'ActivityTableArn', {
      value: this.table.tableArn,
      description: 'ARN of the Activity DynamoDB table',
      exportName: `ActivityTableArn${props.envSuffix}`,
    });

    // ─── Lambda Functions ──────────────────────────────────────────────

    const lambdaEnvironment = {
      TABLE_NAME: this.table.tableName,
      LOG_LEVEL: props.environment === 'prod' ? 'INFO' : 'DEBUG',
    };

    const lambdaBundling = {
      minify: true,
      sourceMap: false,
      externalModules: ['@aws-sdk/*'],
      forceDockerBundling: false,
    };

    this.getWordsFunction = new lambdaNodejs.NodejsFunction(this, 'GetWordsFunction', {
      functionName: `speak-greek-now-get-words${props.envSuffix}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'lambda', 'handlers', 'get-words-handler.ts'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      description: `Retrieves word banks for a user — ${props.environment} environment`,
      bundling: lambdaBundling,
    });

    this.table.grantReadData(this.getWordsFunction);

    this.putWordsFunction = new lambdaNodejs.NodejsFunction(this, 'PutWordsFunction', {
      functionName: `speak-greek-now-put-words${props.envSuffix}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'lambda', 'handlers', 'put-words-handler.ts'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      description: `Adds words to a user's word bank — ${props.environment} environment`,
      bundling: lambdaBundling,
    });

    this.table.grantReadWriteData(this.putWordsFunction);

    this.moveWordFunction = new lambdaNodejs.NodejsFunction(this, 'MoveWordFunction', {
      functionName: `speak-greek-now-move-word${props.envSuffix}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'lambda', 'handlers', 'move-word-handler.ts'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      description: `Moves a word between banks — ${props.environment} environment`,
      bundling: lambdaBundling,
    });

    this.table.grantReadWriteData(this.moveWordFunction);
  }
}
