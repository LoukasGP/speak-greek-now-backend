# Ticket 3A: Backend — `wordsIDoNotKnow` Storage (Structured Objects)

**Parent:** Ticket 3 in `speak-hellenic` repo — `features/todo/3-clicked-words-become-stored.md`  
**Status:** 🔴 Not Started  
**Estimated Time:** 3–4 hours  
**Dependencies:** None (can be done independently)

**Design Decision (2026-02-26):** Words are stored as structured `StoredWord` objects (`{ greek, english, lessonId, addedAt }`) rather than bare `string[]`. This provides full metadata needed by the flashcards feature (Ticket #5) without re-translation, and avoids a rework migration later.

**Knowledge:** Must be consulted before implementation (per `.github/copilot-instructions.md`):

- [hexagonal-architecture.md](../../knowledge/hexagonal-architecture.md) — Domain model with no infra deps, thin handler adapters, mocked adapter unit tests
- [testing-serverless-cdk.md](../../knowledge/testing-serverless-cdk.md) — Unit tests with mocked adapters + cloud-based integration tests
- [aws-cdk-table-v2.md](../../knowledge/aws-cdk-table-v2.md) — DynamoDB is schema-less; no table change needed for new attributes
- [nodejsfunction-aws-cdk.md](../../knowledge/nodejsfunction-aws-cdk.md) — Lambda handler configuration patterns
- [aws-cdk-cli-commands-guide.md](../../knowledge/aws-cdk-cli-commands-guide.md) — Use `cdk diff` to preview changes before deploying

---

## 📋 Objective

Extend the backend `User` domain model, DynamoDB adapter, update use case, and Lambda handler to support a new `wordsIDoNotKnow: StoredWord[]` field. Each `StoredWord` contains the Greek word, its English translation, lesson provenance, and a timestamp — providing all metadata needed by the flashcards feature.

---

## 🎯 What This Ticket Delivers

1. **`StoredWord` domain entity** — `{ greek, english, lessonId, addedAt }` with validation
2. **`User` entity** extended with `wordsIDoNotKnow: ReadonlyArray<StoredWord>` field
3. **Immutable domain methods** — `addWordIDoNotKnow()`, `removeWordIDoNotKnow()`, `hasWordIDoNotKnow()`
4. **DynamoDB adapter** reads and writes structured `StoredWord` objects
5. **`UpdateUserUseCase`** extended with `addWordIDoNotKnow()` method and `wordsIDoNotKnow` in `UpdateUserInput`
6. **`update-user-handler`** passes through `wordsIDoNotKnow` from request body with input validation
7. **Unit tests** for all new domain and use-case logic
8. **Backward compatibility** — existing users without the field default to `[]`

---

## 📦 Prerequisites

- [x] Hexagonal architecture in place (domain → ports → adapters)
- [x] `PUT /users/{userId}` endpoint operational
- [x] Knowledge base consulted (`knowledge/` directory)

---

## 📋 StoredWord Schema

```typescript
interface StoredWord {
  readonly greek: string; // Greek Unicode characters only (/^[\u0370-\u03FF\u1F00-\u1FFF\s]+$/)
  readonly english: string; // Non-empty translation string
  readonly lessonId: string; // Lesson provenance (e.g. "greetings-1")
  readonly addedAt: string; // ISO 8601 timestamp
}
```

---

## 🏗️ Architecture (No Change)

Per [hexagonal-architecture.md](../../knowledge/hexagonal-architecture.md), the existing ports-and-adapters architecture remains unchanged. We are only adding a new field to the existing data flow:

```
Frontend (Next.js)
       ↓ PUT /users/{userId}
       ↓ { wordsIDoNotKnow: [{ greek, english, lessonId, addedAt }] }
       ↓
API Gateway → Lambda → UpdateUserUseCase → DynamoDBUserRepository → DynamoDB
```

---

## 🔨 Implementation Steps

### Step 1: Create `StoredWord` Domain Entity

**File to create:** `lib/lambda/domain/entities/StoredWord.ts`

Per [hexagonal-architecture.md](../../knowledge/hexagonal-architecture.md): domain entities are pure with no infrastructure dependencies. Validation in the constructor.

- Define `StoredWord` class with `readonly` fields: `greek`, `english`, `lessonId`, `addedAt`
- Validate `greek` against Greek Unicode regex: `/^[\u0370-\u03FF\u1F00-\u1FFF\s]+$/`
- Validate `english` is non-empty (trimmed)
- Validate `addedAt` is a valid ISO 8601 date string
- `toJSON()` and `fromJSON()` static methods for serialization
- Equality check by `greek` field (for deduplication)

**Acceptance Criteria:**

- [ ] `new StoredWord({ greek: "καλημέρα", english: "good morning", lessonId: "greetings-1", addedAt: "2026-02-26T14:30:00.000Z" })` succeeds
- [ ] `new StoredWord({ greek: "hello", ... })` throws `ValidationError` (non-Greek characters)
- [ ] `new StoredWord({ greek: "καλημέρα", english: "", ... })` throws `ValidationError`
- [ ] `toJSON()` returns plain object, `fromJSON()` reconstructs instance
- [ ] Two `StoredWord` instances with same `greek` are considered equal via `equals(other)`

---

### Step 2: Extend `User` Entity

**File:** `lib/lambda/domain/entities/User.ts`

Per [hexagonal-architecture.md](../../knowledge/hexagonal-architecture.md): the `User` entity is a pure domain model with no infrastructure dependencies. All mutation methods return new immutable instances.

Changes:

- Add `wordsIDoNotKnow: ReadonlyArray<StoredWord>` as a new `readonly` constructor parameter (default `[]`)
- Add method `addWordIDoNotKnow(word: StoredWord): User` — returns a new `User` with the word appended (deduplicated by `greek` field, case-sensitive exact match)
- Add method `removeWordIDoNotKnow(greek: string): User` — returns a new `User` with the word removed
- Add method `hasWordIDoNotKnow(greek: string): boolean` — checks if word exists by `greek` field
- Update `updateLastLogin()` — thread through `wordsIDoNotKnow`
- Update `addCompletedLesson()` — thread through `wordsIDoNotKnow`
- Update `updateCompletedLessons()` — thread through `wordsIDoNotKnow`
- Update `toJSON()` — include `wordsIDoNotKnow` (call `StoredWord.toJSON()` on each)
- Update `fromJSON()` — parse `wordsIDoNotKnow` with `|| []` fallback, reconstruct `StoredWord` instances

**Acceptance Criteria:**

- [ ] `wordsIDoNotKnow` defaults to `[]` when not provided
- [ ] `addWordIDoNotKnow(storedWord)` returns a new User with the structured word in the array
- [ ] Duplicate words (same `greek` field) are silently ignored (no error, returns same user)
- [ ] `removeWordIDoNotKnow("καλημέρα")` returns a new User without the word
- [ ] Removing a word that doesn't exist returns the same user instance
- [ ] All existing mutation methods preserve `wordsIDoNotKnow` through the new User
- [ ] `toJSON()` includes serialized `wordsIDoNotKnow` in output
- [ ] `fromJSON()` handles missing field gracefully (defaults to `[]`)
- [ ] `fromJSON()` handles legacy `string[]` format gracefully (wraps each string with empty `english`, `lessonId`, `addedAt`)

---

### Step 3: Update DynamoDB Adapter

**File:** `lib/lambda/adapters/DynamoDBUserRepository.ts`

Changes:

- Update `toDynamoDBItem()` — include `wordsIDoNotKnow` as a List of Maps (each Map has `greek`, `english`, `lessonId`, `addedAt` keys)
- Update `fromDynamoDBItem()` — read `wordsIDoNotKnow` with `|| []` fallback, reconstruct `StoredWord` instances from DynamoDB Maps
- Update `updateUser()` — add `wordsIDoNotKnow` to the `SET` expression

**Acceptance Criteria:**

- [ ] `toDynamoDBItem()` includes `wordsIDoNotKnow` as array of `{ greek, english, lessonId, addedAt }` objects
- [ ] `fromDynamoDBItem()` reads structured `wordsIDoNotKnow` with `[]` fallback for existing users
- [ ] `updateUser()` SET expression includes `wordsIDoNotKnow = :wordsIDoNotKnow`
- [ ] Existing users without the field are read without error

---

### Step 4: Extend `UpdateUserUseCase`

**File:** `lib/lambda/domain/use-cases/UpdateUserUseCase.ts`

Changes:

- Add `wordsIDoNotKnow?: StoredWord[]` to `UpdateUserInput` interface
- In `execute()`: if `input.wordsIDoNotKnow !== undefined`, construct a new User with updated words
- Update `validateInput()`: accept `wordsIDoNotKnow` as a valid field (update the "at least one field" check)
- Add method `addWordIDoNotKnow(userId: string, word: StoredWord): Promise<User>` — convenience method following the `addCompletedLesson` pattern

**Acceptance Criteria:**

- [ ] `execute({ userId, wordsIDoNotKnow: [storedWord] })` updates the user's word list
- [ ] Validation passes when only `wordsIDoNotKnow` is provided
- [ ] `addWordIDoNotKnow(userId, storedWord)` fetches user, adds word, and saves
- [ ] Adding a duplicate word returns the user unchanged (no error)
- [ ] Updating with empty array `[]` clears the word list

---

### Step 5: Extend Lambda Handler

**File:** `lib/lambda/handlers/update-user-handler.ts`

Per [hexagonal-architecture.md](../../knowledge/hexagonal-architecture.md): Lambda handlers are thin input adapters — they parse the event, delegate to the use case, and format the response. No business logic in the handler.

Changes:

- Parse `wordsIDoNotKnow` from `body` and pass to `UpdateUserUseCase.execute()`
- Validate each item in the array is a well-formed `StoredWord`:
  - `greek`: non-empty, Greek Unicode regex
  - `english`: non-empty string
  - `lessonId`: non-empty string
  - `addedAt`: valid ISO 8601 date
- Return 400 for invalid input with descriptive error message

**Acceptance Criteria:**

- [ ] `PUT /users/{userId}` with `{ "wordsIDoNotKnow": [{ "greek": "καλημέρα", "english": "good morning", "lessonId": "greetings-1", "addedAt": "2026-02-26T00:00:00Z" }] }` returns 200 with updated user
- [ ] Response JSON includes `wordsIDoNotKnow` array with structured objects
- [ ] Omitting `wordsIDoNotKnow` from body does not affect the field (backward compatible)
- [ ] Sending `wordsIDoNotKnow` alongside other fields (e.g. `lastLoginAt`) works correctly
- [ ] Invalid `greek` value (non-Greek characters) returns 400
- [ ] Missing required fields in a `StoredWord` returns 400

---

### Step 6: Unit Tests

Per [testing-serverless-cdk.md](../../knowledge/testing-serverless-cdk.md): unit tests use `InMemoryUserRepository` (no mocks/stubs needed). Domain logic is tested in isolation from infrastructure. Cloud-based integration tests should be run post-deploy to validate IAM, timeouts, and DynamoDB interactions.

**Files:**

- `test/unit/StoredWord.test.ts` — new file for `StoredWord` entity tests
- `test/unit/User.test.ts` — new describe block for `wordsIDoNotKnow`
- `test/unit/UpdateUserUseCase.test.ts` — new describe block for word operations

**New test cases for `StoredWord.test.ts`:**

- [ ] Valid Greek word constructs successfully
- [ ] Non-Greek `greek` field throws `ValidationError`
- [ ] Empty `english` throws `ValidationError`
- [ ] Invalid `addedAt` (non-ISO) throws `ValidationError`
- [ ] `toJSON()` and `fromJSON()` round-trip correctly
- [ ] `equals()` compares by `greek` field

**New test cases for `User.test.ts`:**

- [ ] `wordsIDoNotKnow` defaults to empty array
- [ ] `addWordIDoNotKnow` adds a structured word and returns new User
- [ ] `addWordIDoNotKnow` with duplicate `greek` returns same User instance
- [ ] `removeWordIDoNotKnow` removes a word and returns new User
- [ ] `removeWordIDoNotKnow` with non-existent word returns same User instance
- [ ] `hasWordIDoNotKnow` returns true/false correctly
- [ ] `toJSON` includes serialized `wordsIDoNotKnow`
- [ ] `fromJSON` with missing field defaults to `[]`
- [ ] `fromJSON` round-trips correctly with structured objects
- [ ] Mutation methods (`updateLastLogin`, `addCompletedLesson`) preserve `wordsIDoNotKnow`

**New test cases for `UpdateUserUseCase.test.ts`:**

- [ ] `execute` with `wordsIDoNotKnow` updates user
- [ ] `execute` with only `wordsIDoNotKnow` passes validation
- [ ] `addWordIDoNotKnow` adds structured word to existing user
- [ ] `addWordIDoNotKnow` with duplicate is idempotent
- [ ] `addWordIDoNotKnow` throws `UserNotFoundError` for missing user
- [ ] `addWordIDoNotKnow` throws `ValidationError` for invalid `StoredWord`

---

## ✅ Verification

```bash
# Quality gates (must all pass before commit)
npm run test:unit
npx tsc --noEmit
npm run lint

# Preview infrastructure changes before deploying (per aws-cdk-cli-commands-guide.md)
npx cdk diff --context environment=dev

# Deploy (dev environment)
npx cdk deploy --context environment=dev

# Smoke test via curl
curl -X PUT https://{api-url}/users/{userId} \
  -H "Content-Type: application/json" \
  -H "x-api-key: {key}" \
  -d '{
    "wordsIDoNotKnow": [
      {
        "greek": "καλημέρα",
        "english": "good morning",
        "lessonId": "greetings-1",
        "addedAt": "2026-02-26T14:30:00.000Z"
      }
    ]
  }'

# Post-deploy: cloud integration test (per testing-serverless-cdk.md)
# Verify Lambda + DynamoDB interaction in the actual AWS environment
npm run test:e2e
```

---

## 📋 DynamoDB Schema Change

**No migration needed.** Per [aws-cdk-table-v2.md](../../knowledge/aws-cdk-table-v2.md), DynamoDB is schema-less — the new attribute is added on next write. No GSI is required since `wordsIDoNotKnow` is never queried independently (always fetched with the User item by `userId` partition key). Existing items will return `undefined` for `wordsIDoNotKnow`, which `fromDynamoDBItem()` handles via `|| []` fallback.

| Attribute             | Type     | Key Type      | Description                                                        |
| --------------------- | -------- | ------------- | ------------------------------------------------------------------ |
| `userId`              | String   | Partition Key | Google OAuth user ID                                               |
| `email`               | String   | Attribute     | User's email                                                       |
| `name`                | String   | Attribute     | Display name                                                       |
| `picture`             | String   | Attribute     | Profile picture URL                                                |
| `createdAt`           | String   | Attribute     | ISO timestamp                                                      |
| `lastLoginAt`         | String   | Attribute     | ISO timestamp                                                      |
| `completedLessons`    | List     | Attribute     | Array of `{id, at}`                                                |
| **`wordsIDoNotKnow`** | **List** | **Attribute** | **Array of `{ greek, english, lessonId, addedAt }` objects (NEW)** |

---

## 📁 Files Summary

| Action | File                                                                                       |
| ------ | ------------------------------------------------------------------------------------------ |
| Create | `lib/lambda/domain/entities/StoredWord.ts` — new domain entity                             |
| Create | `test/unit/StoredWord.test.ts` — entity unit tests                                         |
| Modify | `lib/lambda/domain/entities/User.ts` — add `wordsIDoNotKnow: StoredWord[]`                 |
| Modify | `lib/lambda/adapters/DynamoDBUserRepository.ts` — serialize/deserialize structured objects |
| Modify | `lib/lambda/adapters/InMemoryUserRepository.ts` — thread through new field                 |
| Modify | `lib/lambda/domain/use-cases/UpdateUserUseCase.ts` — accept `wordsIDoNotKnow`              |
| Modify | `lib/lambda/handlers/update-user-handler.ts` — parse + validate structured input           |
| Modify | `test/unit/User.test.ts` — new describe block                                              |
| Modify | `test/unit/UpdateUserUseCase.test.ts` — new describe block                                 |

---

## 🔜 Next Tickets

- **Ticket 3A.1:** Add `wordsIHaveLearned` field and atomic move operations (same pattern)
- **Ticket 3A.2:** E2E tests for deployed word persistence
- **Ticket 3B:** Frontend `WordStorageContext` with two-bank model

---

_Last Updated: February 26, 2026_
