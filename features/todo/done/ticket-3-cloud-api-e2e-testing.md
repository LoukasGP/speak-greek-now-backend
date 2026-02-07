# Ticket 3: Cloud E2E Tests Against Dev API

**Status:** ✅ Complete
**Estimated Time:** 3-5 hours
**Dependencies:** Dev stack deployed

---

## Objective

Add end-to-end tests that call the deployed dev API Gateway and validate real Lambda + DynamoDB behavior using live HTTP requests.

This follows the serverless testing guidance in [knowledge/testing-serverless-cdk.md](../../knowledge/testing-serverless-cdk.md): prioritize cloud tests to validate configuration, IAM, and integrations.

---

## Scope

- Create Jest-based E2E tests under `test/e2e/` that issue real HTTP requests to the dev API.
- Load API endpoint and API key at runtime (no hard-coded secrets).
- Use unique test data per run to avoid collisions.
- Keep tests safe for shared dev environments.

---

## Tasks

1. **Add test config loader**
   - Resolve API URL and API key at runtime by querying the dev CloudFormation stack outputs and API Gateway key value.
   - Use AWS SDK v3 (already a dependency) to fetch CloudFormation outputs and API key value; avoid environment variables for test configuration.

2. **Implement cloud E2E tests**
   - `POST /users` creates a user and returns expected payload.
   - `GET /users/{userId}` returns the created user.
   - `PUT /users/{userId}` updates `lastLoginAt` and returns updated value.
   - Clean up test data directly in DynamoDB (no delete endpoint exists today).

3. **Test data strategy**
   - Generate a unique `userId` per test run (timestamp + random suffix).
   - Add a cleanup helper that deletes the test record directly from DynamoDB using the table name output, with a guard that only deletes test-prefixed IDs.

4. **Documentation**
   - Update README with instructions to run cloud E2E tests (AWS credentials required; no env vars needed).
   - Clarify that `npm run test:e2e` targets the dev stack and queries dev stack outputs automatically.

---

## Acceptance Criteria

- `npm run test:e2e` executes real HTTP calls against the dev API and passes when the stack is deployed.
- Tests fail fast with a clear message when AWS credentials are missing or stack outputs are not found.
- No secrets are committed to the repository.
- README includes a minimal, copy-pasteable setup section for running E2E tests locally.
