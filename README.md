# Speak Greek Now - Backend Infrastructure

CDK infrastructure for the Speak Greek Now application, managing AWS resources for user authentication and lesson storage.

## Project Structure

- `bin/back-end.ts` - CDK app entry point with environment configuration
- `lib/` - Application code and infrastructure stacks
  - `readme.md` - **📖 Detailed application architecture documentation**
  - `user-login-service.ts` - User authentication API and DynamoDB stack
  - `s3-bucket-storage.ts` - S3 bucket for lesson MP3 files
  - `lambda/` - Hexagonal architecture application code (handlers, domain logic, adapters)
- `knowledge/` - Best practices and implementation guidelines
- `features/todo/done/` - Completed feature tickets
- `test/` - Unit, integration, and E2E tests

## Deployment

### Prerequisites

- AWS CLI configured with credentials
- Node.js (v20 or v22 recommended)
- AWS account access with appropriate permissions

### Quick Start

**Set environment variables once per session:**

```powershell
# PowerShell - source the helper script
. .\deploy-helper.ps1

# Or set manually
$env:CDK_DEFAULT_ACCOUNT = (aws sts get-caller-identity --query Account --output text)
$env:CDK_DEFAULT_REGION = (aws configure get region)
```

```bash
# Bash/Linux/Mac
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=$(aws configure get region)
```

**Then deploy normally:**

```bash
npm run deploy:dev    # Deploy dev environment
npm run deploy:prod   # Deploy prod environment
```

### All Deployment Commands

```bash
# List stacks
npm run list:dev      # List dev environment stacks
npm run list:prod     # List prod environment stacks

# Deploy
npm run deploy:dev    # Deploy all dev stacks
npm run deploy:prod   # Deploy all prod stacks

# Compare changes
npm run diff:dev      # Show diff for dev environment
npm run diff:prod     # Show diff for prod environment

# Other commands
npm run build         # Compile TypeScript
npm run test          # Run tests
npm run synth:dev     # Synthesize dev templates
npm run synth:prod    # Synthesize prod templates
npm run destroy:dev   # Destroy dev stacks
npm run destroy:prod  # Destroy prod stacks
```

## Cloud E2E Tests

E2E tests run against the deployed dev API and clean up test data in DynamoDB.

**Prerequisites**:

- Dev stack deployed (`npm run deploy:dev`)
- AWS credentials configured with access to CloudFormation, API Gateway, and DynamoDB

**Run tests**:

```bash
npm run test:e2e
```

### First-Time Setup

If deploying for the first time, CDK bootstrap is required:

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

## Environment Configuration

The project supports two environments:

- **dev** - Development environment (resources suffixed with `-dev`)
- **prod** - Production environment (no suffix, matches existing stacks)

Configuration is in `bin/back-end.ts`:

- API throttling and quotas
- Log retention periods
- Stack naming conventions

## Troubleshooting

### Deployment Failures

If you encounter `AWS::EarlyValidation::ResourceExistenceCheck` errors:

1. Ensure CDK environment variables are set (use npm scripts)
2. Check for orphaned resources from failed deployments
3. See [DEPLOYMENT-FIX-2026-02-04.md](DEPLOYMENT-FIX-2026-02-04.md) for detailed troubleshooting

### Check for Orphaned Resources

```bash
aws cloudformation list-stacks --stack-status-filter ROLLBACK_COMPLETE
aws dynamodb list-tables
aws cloudwatch describe-alarms
```

## Knowledge Base

Before implementing features, consult the knowledge base in `knowledge/`:

- `api-gateway.md` - API Gateway best practices
- `aws-cdk-table-v2.md` - DynamoDB Table V2 usage
- `cdk-environment-how-to.md` - Environment configuration guide
- `aws-cdk-cli-commands-guide.md` - CDK CLI reference

## Stack Outputs

After deployment, important values are exported:

**User Login Service:**

- User API URL
- API Key ID (retrieve value with: `aws apigateway get-api-key --api-key <id> --include-value`)
- DynamoDB table name and ARN

**S3 Storage:**

- Bucket name and ARN
- Bucket URL

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Deployment Guide](DEPLOYMENT.md)
- [Troubleshooting Guide](DEPLOYMENT-FIX-2026-02-04.md)
