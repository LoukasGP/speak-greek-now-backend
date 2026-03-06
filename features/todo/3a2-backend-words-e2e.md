# Ticket 3A.2: Backend — E2E Tests for Word Persistence

**Parent:** Ticket 3 in `speak-hellenic` repo — `work/todo/3-clicked-words-become-stored.md`  
**Status:** 🔴 Not Started  
**Estimated Time:** 1–2 hours  
**Dependencies:** Ticket 3A + Ticket 3A.1 (must be deployed to dev environment)

**Knowledge:** Must be consulted before implementation (per `.github/copilot-instructions.md`):

- [testing-serverless-cdk.md](../../knowledge/testing-serverless-cdk.md) — Cloud-based integration tests validate IAM, timeouts, and DynamoDB interactions
- [aws-cdk-cli-commands-guide.md](../../knowledge/aws-cdk-cli-commands-guide.md) — Use `cdk deploy` before running E2E tests

---

## 📋 Objective

Validate that the deployed backend API correctly persists and retrieves word bank data (`wordsIDoNotKnow` and `wordsIHaveLearned`) with structured `StoredWord` objects, including round-trip persistence and move operations.

---

## 🎯 What This Ticket Delivers

1. **E2E tests** that call the live dev API to validate word persistence
2. **Round-trip validation** — write words → read back → verify structured objects
3. **Move operation validation** — move word between banks → verify both banks updated
4. **Backward compatibility check** — existing users without word fields return `[]`

---

## 📦 Prerequisites

- [ ] **Ticket 3A** deployed to dev environment
- [ ] **Ticket 3A.1** deployed to dev environment
- [x] E2E test infrastructure in place (CloudFormation outputs for API URL + key)

---

## 🔨 Implementation Steps

### Step 1: Create Word Persistence E2E Test

**File to create:** `test/e2e/user-words-api.e2e.test.ts`

Follow the existing E2E pattern in `test/e2e/user-login-api.e2e.test.ts`:

- Load API URL and API key from CloudFormation stack outputs
- Create a test user in `beforeAll`
- Clean up in `afterAll`
- Use `fetch()` to call live API

**Test Scenarios:**

#### Scenario 1: Add `wordsIDoNotKnow` and retrieve

- [ ] `PUT /users/{userId}` with `wordsIDoNotKnow: [{ greek: "καλημέρα", english: "good morning", lessonId: "greetings-1", addedAt: "..." }]`
- [ ] `GET /users/{userId}` returns user with `wordsIDoNotKnow` containing the structured object
- [ ] Verify all fields preserved: `greek`, `english`, `lessonId`, `addedAt`

#### Scenario 2: Add `wordsIHaveLearned` and retrieve

- [ ] `PUT /users/{userId}` with `wordsIHaveLearned: [{ greek: "ευχαριστώ", english: "thank you", lessonId: "greetings-1", addedAt: "..." }]`
- [ ] `GET /users/{userId}` returns user with `wordsIHaveLearned` containing the structured object

#### Scenario 3: Both banks simultaneously

- [ ] `PUT /users/{userId}` with both `wordsIDoNotKnow` and `wordsIHaveLearned`
- [ ] `GET /users/{userId}` returns both banks with correct data
- [ ] Neither bank interferes with the other

#### Scenario 4: Move word between banks (round-trip)

- [ ] Create user with word in `wordsIDoNotKnow`
- [ ] `PUT /users/{userId}` moving word to `wordsIHaveLearned` (remove from unknown, add to learned)
- [ ] `GET /users/{userId}` confirms word is in `wordsIHaveLearned` and NOT in `wordsIDoNotKnow`
- [ ] Metadata (english, lessonId, addedAt) is preserved through the move

#### Scenario 5: Backward compatibility

- [ ] Create a new user (no word fields)
- [ ] `GET /users/{userId}` returns `wordsIDoNotKnow: []` and `wordsIHaveLearned: []`
- [ ] `PUT` with only `lastLoginAt` does NOT affect empty word arrays

#### Scenario 6: Input validation

- [ ] `PUT` with invalid Greek word (non-Greek characters) returns 400
- [ ] `PUT` with missing `english` field in `StoredWord` returns 400
- [ ] `PUT` with invalid `addedAt` returns 400

#### Scenario 7: Special characters

- [ ] Greek accented characters (ά, έ, ή, ί, ό, ύ, ώ) persist correctly
- [ ] Polytonic Greek characters (ᾶ, ῆ, ῶ) persist correctly
- [ ] Multi-word phrases ("καλό πρωί") persist correctly

---

## ✅ Verification

```bash
# Ensure dev environment is deployed with latest changes
npx cdk deploy --context environment=dev

# Run E2E tests
npm run test:e2e

# Or run just the word persistence tests
npx jest test/e2e/user-words-api.e2e.test.ts
```

---

## 📁 Files Summary

| Action | File                                                               |
| ------ | ------------------------------------------------------------------ |
| Create | `test/e2e/user-words-api.e2e.test.ts` — word persistence E2E tests |

---

_Last Updated: February 26, 2026_
