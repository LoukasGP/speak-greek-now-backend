# CDK Deployment Helper
# Sets required CDK environment variables for the current PowerShell session
# Usage: 
#   . .\deploy-helper.ps1        # Source this to set env vars
#   npm run deploy:dev           # Then run deploy commands normally

# Set CDK environment variables from AWS CLI
$env:CDK_DEFAULT_ACCOUNT = (aws sts get-caller-identity --query Account --output text)
$env:CDK_DEFAULT_REGION = (aws configure get region)

Write-Host "CDK Environment Variables Set:" -ForegroundColor Green
Write-Host "  CDK_DEFAULT_ACCOUNT: $env:CDK_DEFAULT_ACCOUNT" -ForegroundColor Cyan
Write-Host "  CDK_DEFAULT_REGION: $env:CDK_DEFAULT_REGION" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now run CDK commands:" -ForegroundColor Yellow
Write-Host "  npm run deploy:dev" -ForegroundColor White
Write-Host "  npm run deploy:prod" -ForegroundColor White
Write-Host "  cdk diff --all -c environment=dev" -ForegroundColor White

