#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ActivityTableStack } from '../lib/activity-table-service';
import { S3StorageStack } from '../lib/s3-bucket-storage';
import { UserLoginServiceStack } from '../lib/user-login-service';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') || 'prod';

const envConfig = {
  dev: {
    stackSuffix: '-dev',
    apiUsagePlanName: 'Development Usage Plan',
    apiUsagePlanDescription: 'Usage plan for development environment',
    apiThrottleRate: 50,
    apiThrottleBurst: 100,
    apiQuotaLimit: 50000,
    logRetentionDays: 2,
  },
  prod: {
    stackSuffix: '',
    apiUsagePlanName: 'Production Usage Plan',
    apiUsagePlanDescription: 'Usage plan for production environment',
    apiThrottleRate: 50,
    apiThrottleBurst: 100,
    apiQuotaLimit: 50000,
    logRetentionDays: 14,
  },
};

const config = envConfig[environment as keyof typeof envConfig];

if (!config) {
  throw new Error(
    `Invalid environment: ${environment}. Must be 'dev' or 'prod'. Use: cdk deploy -c environment=dev`
  );
}

new S3StorageStack(app, `SpeakHellenic-S3StorageStack${config.stackSuffix}`, {
  environment,
  envSuffix: config.stackSuffix,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: `S3 Storage Stack for ${environment} environment - Speak Hellenic MP3 files`,
  tags: {
    Environment: environment,
    Project: 'SpeakHellenic',
    ManagedBy: 'CDK',
  },
});

const activityStack = new ActivityTableStack(
  app,
  `SpeakHellenic-ActivityTableStack${config.stackSuffix}`,
  {
    environment,
    envSuffix: config.stackSuffix,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    description: `Activity Table Stack for ${environment} environment - Words, stories, lessons, gamification`,
    tags: {
      Environment: environment,
      Project: 'SpeakHellenic',
      ManagedBy: 'CDK',
    },
  }
);

const userLoginStack = new UserLoginServiceStack(
  app,
  `SpeakHellenic-UserLoginServiceStack${config.stackSuffix}`,
  {
    environment,
    envSuffix: config.stackSuffix,
    getWordsFunction: activityStack.getWordsFunction,
    putWordsFunction: activityStack.putWordsFunction,
    moveWordFunction: activityStack.moveWordFunction,
    getLessonStateFunction: activityStack.getLessonStateFunction,
    putLessonStateFunction: activityStack.putLessonStateFunction,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    description: `User Login Service Stack for ${environment} environment - Authentication and user management`,
    tags: {
      Environment: environment,
      Project: 'SpeakHellenic',
      ManagedBy: 'CDK',
    },
  }
);

userLoginStack.addDependency(activityStack);
