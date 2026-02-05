# Deployment Fix Summary - February 4, 2026

## Issues Encountered

### 1. AWS::EarlyValidation::ResourceExistenceCheck Failure

**Error Message:**

```
Failed to create ChangeSet cdk-deploy-change-set on SpeakHellenic-UserLoginServiceStack-dev: FAILED,
The following hook(s)/validation failed: [AWS::EarlyValidation::ResourceExistenceCheck]
```

**Root Causes:**

1. **Missing CDK environment variables** - `CDK_DEFAULT_ACCOUNT` and `CDK_DEFAULT_REGION` were not set
2. **Hardcoded resource names without environment suffixes** - Caused conflicts between dev and prod stacks
3. **Orphaned DynamoDB table** from a previous failed deployment

## Fixes Applied

### 1. Added Environment Suffixes to Named Resources

Updated the following resources in `lib/user-login-service.ts` to include `${props.envSuffix}`:

- **API Gateway REST API name** (line 46)
  - Before: `'Speak Greek Now User API'`
  - After: `` `Speak Greek Now User API${props.envSuffix}` ``

- **API Key name** (line 91)
  - Before: `'speak-greek-now-user-api-key'`
  - After: `` `speak-greek-now-user-api-key${props.envSuffix}` ``

- **Usage Plan name** (line 96)
  - Before: `'MVP Usage Plan'`
  - After: `` `MVP Usage Plan${props.envSuffix}` ``

- **CloudWatch Alarm name** (line 455)
  - Before: `'SpeakHellenic-UserApi-HighErrorRate'`
  - After: `` `SpeakHellenic-UserApi-HighErrorRate${props.envSuffix}` ``

### 2. Updated Deployment Scripts

Modified `package.json` to automatically set CDK environment variables:

```json
"deploy:dev": "pwsh -NoProfile -Command \"$env:CDK_DEFAULT_ACCOUNT = (aws sts get-caller-identity --query Account --output text); $env:CDK_DEFAULT_REGION = (aws configure get region); cdk deploy --all -c environment=dev --require-approval never\"",
"deploy:prod": "pwsh -NoProfile -Command \"$env:CDK_DEFAULT_ACCOUNT = (aws sts get-caller-identity --query Account --output text); $env:CDK_DEFAULT_REGION = (aws configure get region); cdk deploy --all -c environment=prod --require-approval never\""
```

### 3. Created Deployment Helper Script

Added `deploy-helper.ps1` for easier manual deployments:

```powershell
.\deploy-helper.ps1 -Environment dev
.\deploy-helper.ps1 -Environment prod
.\deploy-helper.ps1 -Environment dev -StackName SpeakHellenic-UserLoginServiceStack-dev
```

### 4. Cleaned Up Orphaned Resources

Deleted the orphaned DynamoDB table from the failed deployment:

```bash
aws dynamodb delete-table --table-name speak-greek-now-users-dev
```

## Why This Happened

### AWS CloudFormation Early Validation

AWS CloudFormation introduced the `AWS::EarlyValidation::ResourceExistenceCheck` hook that validates resources **before** creating the change set. This hook checks if:

1. Named resources (with explicit names) already exist
2. Resources referenced in the template actually exist
3. Cross-stack references are valid

### CDK Environment Variables

When using `process.env.CDK_DEFAULT_ACCOUNT` and `process.env.CDK_DEFAULT_REGION` in stack definitions:

- These environment variables MUST be set before running CDK commands
- Without them, CDK cannot properly resolve the account and region
- This causes early validation to fail because resources can't be verified

## Best Practices Going Forward

### 1. Always Use Environment Suffixes for Named Resources

When creating resources with explicit names, always include the environment suffix:

```typescript
// ❌ Bad - Will conflict between environments
const apiKey = api.addApiKey('ApiKey', {
  apiKeyName: 'my-api-key',
});

// ✅ Good - Unique per environment
const apiKey = api.addApiKey('ApiKey', {
  apiKeyName: `my-api-key${props.envSuffix}`,
  description: `API key - ${props.environment} environment`,
});
```

### 2. Use the Deployment Scripts

Always use the npm scripts or deployment helper:

```bash
# Use npm scripts
npm run deploy:dev
npm run deploy:prod

# Or use the helper script
.\deploy-helper.ps1 -Environment dev
```

**Don't run** `cdk deploy` directly without setting environment variables!

### 3. Check for Orphaned Resources

After a failed deployment, check for orphaned resources:

```bash
# List CloudFormation stacks
aws cloudformation list-stacks --stack-status-filter ROLLBACK_COMPLETE

# List DynamoDB tables
aws dynamodb list-tables

# List S3 buckets
aws s3 ls

# List CloudWatch alarms
aws cloudwatch describe-alarms
```

### 4. Use RemovalPolicy Wisely

For dev environments, consider using `DESTROY` instead of `RETAIN`:

```typescript
// Development - allows clean deletion
removalPolicy: props.environment === 'dev'
  ? cdk.RemovalPolicy.DESTROY
  : cdk.RemovalPolicy.RETAIN,
```

## Testing the Fix

Successfully deployed dev stack:

```
✅ SpeakHellenic-S3StorageStack-dev
✅ SpeakHellenic-UserLoginServiceStack-dev
```

**Outputs:**

- User API URL: `https://inncptxwwi.execute-api.eu-west-1.amazonaws.com/prod/`
- User API Key ID: `45b8ez8dq7`
- Users Table: `speak-greek-now-users-dev`

## References

- [CDK Environment Configuration](./knowledge/cdk-environment-how-to.md)
- [AWS CDK Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
- [CloudFormation Early Validation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/hooks.html)
