# Ticket 3A.1: Backend — `wordsIHaveLearned` & Move Operations

**Parent:** Ticket 3 in `speak-hellenic` repo — `work/todo/3-clicked-words-become-stored.md`  
**Status:** 🔴 Not Started  
**Estimated Time:** 2–3 hours  
**Dependencies:** Ticket 3A (backend `wordsIDoNotKnow` with `StoredWord`)

**Knowledge:** Must be consulted before implementation (per `.github/copilot-instructions.md`):

- [hexagonal-architecture.md](../../knowledge/hexagonal-architecture.md) — Domain model with no infra deps, thin handler adapters, mocked adapter unit tests
- [testing-serverless-cdk.md](../../knowledge/testing-serverless-cdk.md) — Unit tests with mocked adapters + cloud-based integration tests
- [aws-cdk-table-v2.md](../../knowledge/aws-cdk-table-v2.md) — DynamoDB is schema-less; no table change needed for new attributes

---

## 📋 Objective

Extend the `User` entity with a second word bank (`wordsIHaveLearned: StoredWord[]`) and add atomic move operations that transfer words between `wordsIDoNotKnow` and `wordsIHaveLearned`. This enables the flashcard "Got it" / "Still learning" rating mechanic (Ticket #5).

---

## 🎯 What This Ticket Delivers

1. **`User` entity** extended with `wordsIHaveLearned: ReadonlyArray<StoredWord>` field
2. **Immutable domain methods** — `addWordIHaveLearned()`, `removeWordIHaveLearned()`, `hasLearnedWord()`
3. **Atomic move methods** — `moveWordToLearned(greek)`, `moveWordToUnknown(greek)`
4. **DynamoDB adapter** reads and writes `wordsIHaveLearned`
5. **`UpdateUserUseCase`** extended with `wordsIHaveLearned` in `UpdateUserInput`
6. **`update-user-handler`** passes through `wordsIHaveLearned` with input validation
7. **Unit tests** for all new domain and use-case logic, especially move operations
8. **Backward compatibility** — existing users without the field default to `[]`

---

## 📦 Prerequisites

- [ ] **Ticket 3A** completed — `StoredWord` entity and `wordsIDoNotKnow` field exist on `User`
- [x] Hexagonal architecture in place (domain → ports → adapters)
- [x] `PUT /users/{userId}` endpoint operational
- [x] Knowledge base consulted (`knowledge/` directory)

---

## 🏗️ Architecture (No Change)

Same architecture as Ticket 3A. The existing `PUT /users/{userId}` endpoint is extended to accept both word banks:

```
Frontend (Next.js)
       ↓ PUT /users/{userId}
       ↓ { wordsIDoNotKnow: [...], wordsIHaveLearned: [...] }
       ↓
API Gateway → Lambda → UpdateUserUseCase → DynamoDBUserRepository → DynamoDB
```

---

## 🔨 Implementation Steps

### Step 1: Extend `User` Entity with `wordsIHaveLearned`

**File:** `lib/lambda/domain/entities/User.ts`

Changes:

- Add `wordsIHaveLearned: ReadonlyArray<StoredWord>` as a new `readonly` constructor parameter (default `[]`)
- Add method `addWordIHaveLearned(word: StoredWord): User` — returns a new `User` with the word appended (deduplicated by `greek` field)
- Add method `removeWordIHaveLearned(greek: string): User` — returns a new `User` with the word removed
- Add method `hasLearnedWord(greek: string): boolean` — checks if word exists in `wordsIHaveLearned`
- Update all existing mutation methods to thread through `wordsIHaveLearned` (same as was done for `wordsIDoNotKnow` in 3A)
- Update `toJSON()` and `fromJSON()` to include `wordsIHaveLearned`

**Acceptance Criteria:**

- [ ] `wordsIHaveLearned` defaults to `[]` when not provided
- [ ] `addWordIHaveLearned(storedWord)` returns a new User with the word in the learned array
- [ ] Duplicate words (same `greek` field) are silently ignored
- [ ] `removeWordIHaveLearned("καλημέρα")` returns a new User without the word
- [ ] `hasLearnedWord("καλημέρα")` returns true/false correctly
- [ ] All existing mutation methods preserve `wordsIHaveLearned` through the new User
- [ ] `toJSON()` includes serialized `wordsIHaveLearned`
- [ ] `fromJSON()` handles missing field gracefully (defaults to `[]`)

---

### Step 2: Add Atomic Move Operations

**File:** `lib/lambda/domain/entities/User.ts`

These are the key methods for the flashcard feature's "Got it" and "Still learning" ratings.

Changes:

- Add method `moveWordToLearned(greek: string): User` — atomically:
  1. Finds the `StoredWord` in `wordsIDoNotKnow` by `greek` field
  2. Removes it from `wordsIDoNotKnow`
  3. Adds it to `wordsIHaveLearned` (with preserved metadata)
  4. Returns a new `User` with both arrays updated
  5. If word not found in `wordsIDoNotKnow`, returns same user (no-op)
  6. If word already exists in `wordsIHaveLearned`, only removes from `wordsIDoNotKnow`

- Add method `moveWordToUnknown(greek: string): User` — reverse of above:
  1. Finds the `StoredWord` in `wordsIHaveLearned` by `greek` field
  2. Removes it from `wordsIHaveLearned`
  3. Adds it to `wordsIDoNotKnow`
  4. Returns a new `User` with both arrays updated
  5. If word not found in `wordsIHaveLearned`, returns same user (no-op)

**Acceptance Criteria:**

- [ ] `moveWordToLearned("καλημέρα")` moves the word from `wordsIDoNotKnow` to `wordsIHaveLearned`
- [ ] After move, the word is NOT in `wordsIDoNotKnow` and IS in `wordsIHaveLearned`
- [ ] The moved word retains its original `english`, `lessonId`, and `addedAt` metadata
- [ ] `moveWordToLearned` on a word not in `wordsIDoNotKnow` returns the same user (no-op)
- [ ] `moveWordToLearned` on a word already in `wordsIHaveLearned` just removes from `wordsIDoNotKnow`
- [ ] `moveWordToUnknown("καλημέρα")` moves the word in the reverse direction
- [ ] Both operations are atomic — a word never appears in both banks simultaneously
- [ ] Both operations return immutable new `User` instances

---

### Step 3: Update DynamoDB Adapter

**File:** `lib/lambda/adapters/DynamoDBUserRepository.ts`

Changes:

- Update `toDynamoDBItem()` — include `wordsIHaveLearned` as a List of Maps (same format as `wordsIDoNotKnow`)
- Update `fromDynamoDBItem()` — read `wordsIHaveLearned` with `|| []` fallback
- Update `updateUser()` — add `wordsIHaveLearned` to the `SET` expression

**Acceptance Criteria:**

- [ ] `toDynamoDBItem()` includes `wordsIHaveLearned` array of structured objects
- [ ] `fromDynamoDBItem()` reads `wordsIHaveLearned` with `[]` fallback
- [ ] `updateUser()` SET expression includes `wordsIHaveLearned = :wordsIHaveLearned`
- [ ] Existing users without the field are read without error

---

### Step 4: Extend `UpdateUserUseCase`

**File:** `lib/lambda/domain/use-cases/UpdateUserUseCase.ts`

Changes:

- Add `wordsIHaveLearned?: StoredWord[]` to `UpdateUserInput` interface
- In `execute()`: if `input.wordsIHaveLearned !== undefined`, construct a new User with updated learned words
- Update `validateInput()`: accept `wordsIHaveLearned` as a valid field
- Add convenience methods:
  - `moveWordToLearned(userId: string, greek: string): Promise<User>` — fetches user, calls `user.moveWordToLearned(greek)`, saves
  - `moveWordToUnknown(userId: string, greek: string): Promise<User>` — reverse

**Acceptance Criteria:**

- [ ] `execute({ userId, wordsIHaveLearned: [storedWord] })` updates the user's learned words
- [ ] Validation passes when only `wordsIHaveLearned` is provided
- [ ] Validation passes when both `wordsIDoNotKnow` and `wordsIHaveLearned` are provided
- [ ] `moveWordToLearned(userId, "καλημέρα")` atomically updates both banks
- [ ] `moveWordToUnknown(userId, "καλημέρα")` atomically updates both banks
- [ ] Move on non-existent user throws `UserNotFoundError`
- [ ] Move on non-existent word returns user unchanged

---

### Step 5: Extend Lambda Handler

**File:** `lib/lambda/handlers/update-user-handler.ts`

Changes:

- Parse `wordsIHaveLearned` from `body` and pass to `UpdateUserUseCase.execute()`
- Apply same validation as `wordsIDoNotKnow` (each item must be a valid `StoredWord`)

**Acceptance Criteria:**

- [ ] `PUT /users/{userId}` with `{ "wordsIHaveLearned": [...] }` returns 200 with updated user
- [ ] Response JSON includes both `wordsIDoNotKnow` and `wordsIHaveLearned` arrays
- [ ] Both fields can be sent together in a single request
- [ ] Invalid items in `wordsIHaveLearned` return 400

---

### Step 6: Unit Tests

**Files:**

- `test/unit/User.test.ts` — new describe block for `wordsIHaveLearned` and move operations
- `test/unit/UpdateUserUseCase.test.ts` — new describe block for move operations

**New test cases for `User.test.ts` — `wordsIHaveLearned`:**

- [ ] `wordsIHaveLearned` defaults to empty array
- [ ] `addWordIHaveLearned` adds a word and returns new User
- [ ] `addWordIHaveLearned` with duplicate returns same User instance
- [ ] `removeWordIHaveLearned` removes a word and returns new User
- [ ] `hasLearnedWord` returns true/false correctly
- [ ] `toJSON` includes `wordsIHaveLearned`
- [ ] `fromJSON` handles missing `wordsIHaveLearned` field

- [ ] Mutation methods preserve `wordsIHaveLearned`

**New test cases for `User.test.ts` — move operations:**

- [ ] `moveWordToLearned` removes from `wordsIDoNotKnow` and adds to `wordsIHaveLearned`
- [ ] `moveWordToLearned` preserves word metadata (english, lessonId, addedAt)
- [ ] `moveWordToLearned` with word not in unknown bank returns same user
- [ ] `moveWordToLearned` with word already in learned bank only removes from unknown
- [ ] `moveWordToUnknown` removes from `wordsIHaveLearned` and adds to `wordsIDoNotKnow`
- [ ] `moveWordToUnknown` with word not in learned bank returns same user
- [ ] Word never appears in both banks simultaneously after any move
- [ ] Multiple sequential moves work correctly (move to learned, then back to unknown)

**New test cases for `UpdateUserUseCase.test.ts`:**

- [ ] `execute` with `wordsIHaveLearned` updates user
- [ ] `execute` with both word banks updates correctly
- [ ] `moveWordToLearned` via use case atomically updates both banks
- [ ] `moveWordToUnknown` via use case atomically updates both banks
- [ ] Move on non-existent user throws `UserNotFoundError`

---

## ✅ Verification

```bash
# Quality gates (must all pass before commit)
npm run test:unit
npx tsc --noEmit
npm run lint

# Preview infrastructure changes (should show NO infra changes — only code changes)
npx cdk diff --context environment=dev

# Deploy (dev environment)
npx cdk deploy --context environment=dev

# Smoke test: add word to learned bank
curl -X PUT https://{api-url}/users/{userId} \
  -H "Content-Type: application/json" \
  -H "x-api-key: {key}" \
  -d '{
    "wordsIHaveLearned": [
      {
        "greek": "ευχαριστώ",
        "english": "thank you",
        "lessonId": "greetings-1",
        "addedAt": "2026-02-25T10:00:00.000Z"
      }
    ]
  }'
```

---

## 📋 DynamoDB Schema Change

**No migration needed.** Same as Ticket 3A — DynamoDB is schema-less.

| Attribute               | Type     | Key Type      | Description                             |
| ----------------------- | -------- | ------------- | --------------------------------------- |
| `userId`                | String   | Partition Key | Google OAuth user ID                    |
| `email`                 | String   | Attribute     | User's email                            |
| `name`                  | String   | Attribute     | Display name                            |
| `picture`               | String   | Attribute     | Profile picture URL                     |
| `createdAt`             | String   | Attribute     | ISO timestamp                           |
| `lastLoginAt`           | String   | Attribute     | ISO timestamp                           |
| `completedLessons`      | List     | Attribute     | Array of `{id, at}`                     |
| `wordsIDoNotKnow`       | List     | Attribute     | Array of `StoredWord` objects (from 3A) |
| **`wordsIHaveLearned`** | **List** | **Attribute** | **Array of `StoredWord` objects (NEW)** |

---

## 📁 Files Summary

| Action | File                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| Modify | `lib/lambda/domain/entities/User.ts` — add `wordsIHaveLearned` + move operations                           |
| Modify | `lib/lambda/adapters/DynamoDBUserRepository.ts` — serialize/deserialize `wordsIHaveLearned`                |
| Modify | `lib/lambda/adapters/InMemoryUserRepository.ts` — thread through new field                                 |
| Modify | `lib/lambda/domain/use-cases/UpdateUserUseCase.ts` — accept `wordsIHaveLearned` + move convenience methods |
| Modify | `lib/lambda/handlers/update-user-handler.ts` — parse + validate `wordsIHaveLearned`                        |
| Modify | `test/unit/User.test.ts` — new describe blocks for learned bank + move operations                          |
| Modify | `test/unit/UpdateUserUseCase.test.ts` — new describe blocks for move operations                            |

---

## 🔜 Next Tickets

- **Ticket 3A.2:** E2E tests for deployed word persistence (both banks + moves)
- **Ticket 3B:** Frontend `WordStorageContext` with two-bank model

---

_Last Updated: February 26, 2026_
