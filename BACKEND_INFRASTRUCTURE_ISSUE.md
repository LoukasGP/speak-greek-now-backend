# Backend Infrastructure Issue - DynamoDB User Creation Failure

## ✅ STATUS: RESOLVED

**Resolution Date**: February 6, 2026, 09:17 UTC  
**Fix**: Replaced VTL direct DynamoDB integration with Lambda function  
**See**: [BACKEND-FIX-SUMMARY.md](BACKEND-FIX-SUMMARY.md) for complete details

---

**Date**: February 6, 2026  
**Severity**: ~~CRITICAL~~ RESOLVED ✅  
**Impact**: ~~Users cannot sign in~~ Authentication now working

---

## Executive Summary

Google OAuth authentication completes successfully, but **user creation in DynamoDB is failing silently**. The Next.js frontend cannot create or retrieve users from the backend API, resulting in empty `userId` in sessions and 401 errors.

---

## Current System State

### ✅ Working Components

- Google OAuth flow (authorization code exchange works)
- Google user info retrieval (email, name, picture received)
- JWT session encryption/decryption
- Session cookie creation mechanism
- Frontend API client (`userApiService.ts`)

### ❌ Failing Components

- **DynamoDB user creation** - `POST /users` endpoint
- **DynamoDB user retrieval** - `GET /users/{userId}` endpoint
- User authentication flow (depends on DynamoDB operations)

---

## Environment Configuration

### Frontend Environment Variables (.env.local)

```bash
# API Gateway Configuration
NEXT_PUBLIC_USER_API_URL=https://inncptxwwi.execute-api.eu-west-1.amazonaws.com/prod/
USER_API_KEY=your-api-key-here

# Session Secret
SESSION_SECRET=your-session-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
```

### AWS Resources

- **Region**: eu-west-1
- **API Gateway**: `inncptxwwi.execute-api.eu-west-1.amazonaws.com`
- **Stage**: `prod`
- **DynamoDB Table**: (Table name needed from backend team)

---

## Problem Flow Diagram

```
1. User clicks "Sign In with Google"
   ✅ SUCCESS

2. Google OAuth redirect → /api/auth/callback/google
   ✅ SUCCESS - Receives authorization code

3. Exchange code for tokens
   ✅ SUCCESS - Gets access_token

4. Fetch user info from Google
   ✅ SUCCESS - Receives: { id, email, name, picture }

5. Check if user exists: GET /users/{googleUserId}
   ❌ FAILS - API call to DynamoDB fails or returns unexpected response

6. Create new user: POST /users
   ❌ FAILS - User is NOT created in DynamoDB table

7. Create session with user.userId
   ❌ FAILS - userId is undefined/empty string

8. Session verification
   ❌ FAILS - userId: '' causes 401 on /api/auth/user

Result: User stuck in "Sign In" state, cannot access authenticated features
```

---

## API Request Details

### Expected API Calls

#### 1. Get User by ID

```http
GET https://inncptxwwi.execute-api.eu-west-1.amazonaws.com/prod/users/{userId}
Headers:
  x-api-key: OzODdFZC2i8L4ULV1X7ej6tEetPNBYyE5Zr7SGjU
  Content-Type: application/json

Expected Response (200 OK):
{
  "userId": "123456789",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "createdAt": "2026-02-06T12:00:00.000Z",
  "lastLoginAt": "2026-02-06T12:00:00.000Z",
  "completedLessons": []
}

Expected Response (404 Not Found):
(Empty body or error message)
```

#### 2. Create New User

```http
POST https://inncptxwwi.execute-api.eu-west-1.amazonaws.com/prod/users
Headers:
  x-api-key: OzODdFZC2i8L4ULV1X7ej6tEetPNBYyE5Zr7SGjU
  Content-Type: application/json

Body:
{
  "userId": "123456789",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://lh3.googleusercontent.com/...",
  "createdAt": "2026-02-06T12:00:00.000Z",
  "lastLoginAt": "2026-02-06T12:00:00.000Z"
}

Expected Response (200 OK or 201 Created):
{
  "userId": "123456789",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "createdAt": "2026-02-06T12:00:00.000Z",
  "lastLoginAt": "2026-02-06T12:00:00.000Z"
}
```

#### 3. Update Last Login

```http
PUT https://inncptxwwi.execute-api.eu-west-1.amazonaws.com/prod/users/{userId}/last-login
Headers:
  x-api-key: OzODdFZC2i8L4ULV1X7ej6tEetPNBYyE5Zr7SGjU
  Content-Type: application/json

Expected Response (200 OK)
```

---

## Frontend Implementation (For Reference)

### User API Service (`src/services/userApiService.ts`)

```typescript
// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL;
const API_KEY = process.env.USER_API_KEY;

// Request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}) {
  validateConfig();

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY!,
      ...options.headers,
    },
  });

  // 404 returns null
  if (response.status === 404) {
    return null as T;
  }

  // Non-2xx throws error
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return JSON.parse(await response.text());
}
```

### OAuth Callback Flow (`src/app/api/auth/callback/google/route.ts`)

```typescript
// After getting Google user info...
const googleUser = {
  id: '123456789', // Google user ID
  email: 'user@gmail.com',
  name: 'User Name',
  picture: 'https://...',
};

// 1. Try to fetch existing user
const existingUser = await getUserById(googleUser.id);

// 2. Create user if doesn't exist
const user =
  existingUser ||
  (await createUser({
    userId: googleUser.id,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
  }));

// 3. Create session with userId
await createSession(user.userId); // ❌ user.userId is undefined!
```

---

## Diagnostic Steps for Backend Team

### Step 1: Verify API Gateway Configuration

```bash
# Check if API Gateway is deployed
aws apigateway get-rest-apis --region eu-west-1 | grep inncptxwwi

# Check API key validity
aws apigateway get-api-keys --region eu-west-1 --include-values | grep OzODdFZC2i

# Check usage plan association
aws apigateway get-usage-plans --region eu-west-1
```

**Expected**: API Gateway should be active, API key should be valid and associated with usage plan

### Step 2: Verify DynamoDB Table

```bash
# List tables
aws dynamodb list-tables --region eu-west-1

# Describe user table (replace TABLE_NAME)
aws dynamodb describe-table --table-name [TABLE_NAME] --region eu-west-1

# Check if any users exist
aws dynamodb scan --table-name [TABLE_NAME] --region eu-west-1 --max-items 5
```

**Expected**: Table exists, has partition key `userId` (String), is empty or has test users

### Step 3: Test API Gateway Endpoints Directly

#### Test GET /users/{userId}

```bash
curl -X GET \
  "https://inncptxwwi.execute-api.eu-west-1.amazonaws.com/prod/users/test-user-123" \
  -H "x-api-key: OzODdFZC2i8L4ULV1X7ej6tEetPNBYyE5Zr7SGjU" \
  -H "Content-Type: application/json" \
  -v
```

**Expected**: 404 Not Found (user doesn't exist) or 200 OK (if test user exists)  
**Problem Indicators**:

- 403 Forbidden → API key invalid or not authorized
- 500 Internal Server Error → VTL template or DynamoDB permission issue
- Timeout → Network/routing issue

#### Test POST /users

```bash
curl -X POST \
  "https://inncptxwwi.execute-api.eu-west-1.amazonaws.com/prod/users" \
  -H "x-api-key: OzODdFZC2i8L4ULV1X7ej6tEetPNBYyE5Zr7SGjU" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com",
    "name": "Test User",
    "createdAt": "2026-02-06T12:00:00.000Z",
    "lastLoginAt": "2026-02-06T12:00:00.000Z"
  }' \
  -v
```

**Expected**: 200 OK or 201 Created with user object in response  
**Problem Indicators**:

- 403 Forbidden → API key issue
- 400 Bad Request → VTL template validation error
- 500 Internal Server Error → DynamoDB write permission issue

#### Verify User Created

```bash
aws dynamodb get-item \
  --table-name [TABLE_NAME] \
  --key '{"userId": {"S": "test-user-123"}}' \
  --region eu-west-1
```

**Expected**: Item returned with all fields

### Step 4: Check CloudWatch Logs

```bash
# Get log groups for API Gateway
aws logs describe-log-groups --region eu-west-1 | grep API-Gateway

# Get recent log streams
aws logs describe-log-streams \
  --log-group-name [LOG_GROUP_NAME] \
  --region eu-west-1 \
  --order-by LastEventTime \
  --descending \
  --max-items 5

# Get recent logs
aws logs tail [LOG_GROUP_NAME] --region eu-west-1 --follow
```

**Look for**:

- VTL transformation errors
- DynamoDB permission denied errors
- Malformed request/response errors
- Integration timeout errors

### Step 5: Check IAM Permissions

Verify the API Gateway execution role has:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:eu-west-1:*:table/[TABLE_NAME]"
    }
  ]
}
```

---

## Known Issues to Check

### Issue 1: API Key Not Associated with Stage

**Symptom**: 403 Forbidden  
**Fix**: Associate API key with usage plan and deploy to `prod` stage

```bash
# Create usage plan if not exists
aws apigateway create-usage-plan \
  --name "user-api-usage-plan" \
  --api-stages apiId=inncptxwwi,stage=prod

# Associate API key with usage plan
aws apigateway create-usage-plan-key \
  --usage-plan-id [USAGE_PLAN_ID] \
  --key-id [API_KEY_ID] \
  --key-type API_KEY
```

### Issue 2: VTL Template Returns Wrong Format

**Symptom**: Frontend receives data but `user.userId` is undefined  
**Fix**: Check VTL response mapping template returns correct structure

Expected VTL template response:

```json
{
  "userId": "$input.path('$.Item.userId.S')",
  "email": "$input.path('$.Item.email.S')",
  "name": "$input.path('$.Item.name.S')",
  "picture": "$input.path('$.Item.picture.S')",
  "createdAt": "$input.path('$.Item.createdAt.S')",
  "lastLoginAt": "$input.path('$.Item.lastLoginAt.S')"
}
```

### Issue 3: CORS Configuration

**Symptom**: Browser console shows CORS errors  
**Fix**: Enable CORS on API Gateway

```bash
# Enable CORS for OPTIONS, GET, POST, PUT methods
aws apigateway put-method-response \
  --rest-api-id inncptxwwi \
  --resource-id [RESOURCE_ID] \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin": true}'
```

### Issue 4: DynamoDB Table Doesn't Exist or Wrong Region

**Symptom**: 500 Internal Server Error  
**Fix**: Verify table exists in `eu-west-1` and name matches CloudFormation stack

---

## Minimal Reproduction Test

Run this from your local machine to test API independently of Next.js:

```bash
#!/bin/bash

API_URL="https://inncptxwwi.execute-api.eu-west-1.amazonaws.com/prod"
API_KEY="OzODdFZC2i8L4ULV1X7ej6tEetPNBYyE5Zr7SGjU"

echo "=== Testing User API ==="

# Test 1: Create User
echo -e "\n1. Creating test user..."
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "$API_URL/users" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-diagnostic-123",
    "email": "diagnostic@test.com",
    "name": "Diagnostic Test User",
    "createdAt": "2026-02-06T12:00:00.000Z",
    "lastLoginAt": "2026-02-06T12:00:00.000Z"
  }')

HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

echo "Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "201" ]; then
  echo "❌ CREATE FAILED"
  exit 1
fi

# Test 2: Get User
echo -e "\n2. Retrieving user..."
GET_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "$API_URL/users/test-diagnostic-123" \
  -H "x-api-key: $API_KEY")

HTTP_CODE=$(echo "$GET_RESPONSE" | tail -n1)
BODY=$(echo "$GET_RESPONSE" | sed '$d')

echo "Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ GET FAILED"
  exit 1
fi

# Validate response structure
USER_ID=$(echo "$BODY" | jq -r '.userId // empty')
if [ -z "$USER_ID" ]; then
  echo "❌ RESPONSE MISSING userId FIELD"
  echo "This is the root cause of the authentication issue!"
  exit 1
fi

echo -e "\n✅ All tests passed"
echo "User ID: $USER_ID"
```

Save as `test-user-api.sh`, run: `bash test-user-api.sh`

---

## Expected Backend Actions

1. **Verify API Gateway deployment**
   - Confirm `prod` stage is deployed
   - Confirm API key is valid and associated

2. **Test endpoints with curl commands above**
   - Capture exact error responses
   - Check CloudWatch logs during test

3. **Fix identified issues**:
   - VTL template response mapping
   - IAM permissions
   - DynamoDB table configuration
   - API key association

4. **Validate fix**:
   - Run `test-user-api.sh` successfully
   - Manually test with real Google OAuth user ID

5. **Notify frontend team** when fix is deployed

---

## Success Criteria

### Backend API Working:

- ✅ `POST /users` creates user in DynamoDB and returns user object with `userId`
- ✅ `GET /users/{userId}` retrieves existing user
- ✅ `PUT /users/{userId}/last-login` updates timestamp
- ✅ Response includes all fields: `userId`, `email`, `name`, `picture`, `createdAt`, `lastLoginAt`

### Frontend Authentication Working:

- ✅ User signs in with Google
- ✅ User record created in DynamoDB
- ✅ Session cookie contains valid userId
- ✅ Homepage shows "Account" button instead of "Sign In"
- ✅ `/account` page loads with user data

---

## Contact Information

**Frontend Developer**: (Your contact info)  
**Repository**: speak-hellenic/speak-greek-now  
**Urgency**: CRITICAL - Blocking all user authentication

---

## Additional Context

### Architecture Overview

```
User Browser
    ↓ (Google OAuth)
Next.js Frontend (localhost:3000)
    ↓ (HTTPS with API Key)
API Gateway (inncptxwwi.execute-api.eu-west-1.amazonaws.com/prod)
    ↓ (VTL Templates)
DynamoDB (eu-west-1)
```

### Frontend Code Locations

- OAuth Callback: `src/app/api/auth/callback/google/route.ts` (lines 117-166)
- API Client: `src/services/userApiService.ts`
- Session Management: `src/lib/session.ts`
- Auth Context: `src/contexts/AuthContext.tsx`

### CloudFormation Stack (Backend Repository)

- **Location**: Separate CDK repository (not in this codebase)
- **Resources**: API Gateway, DynamoDB Users Table, IAM Roles, API Keys
- **Infrastructure as Code**: CDK or CloudFormation templates

---

_Last Updated: February 6, 2026_  
_Document Version: 1.0_
