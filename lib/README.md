# Application Architecture

This project uses **Hexagonal Architecture** (also known as Ports & Adapters pattern) to create clean, testable, and maintainable code that separates business logic from infrastructure concerns.

## Code Structure (`lib/lambda/`)

### Domain Layer (Pure Business Logic - Zero AWS Dependencies)

The core of the application contains pure business logic with no external dependencies:

- **`domain/entities/User.ts`** - User entity with validation and business methods
  - Immutable entity representing a user
  - Methods like `updateLastLogin()`, `addCompletedLesson()`, `hasCompletedLesson()`
  - Input validation (email format, required fields)
  - JSON serialization/deserialization

- **`domain/ports/IUserRepository.ts`** - Repository interface (contract)
  - Defines how the domain layer communicates with data storage
  - Pure interface with no implementation details
  - Methods: `getUserById`, `createUser`, `updateUser`, etc.

- **`domain/use-cases/`** - Business logic orchestration
  - `CreateUserUseCase.ts` - Handles user creation with validation and duplicate checking
  - `GetUserUseCase.ts` - Retrieves users with proper error handling
  - `UpdateUserUseCase.ts` - Updates user login times and completed lessons

### Adapters (Infrastructure Implementations)

These implement the domain interfaces and handle external system communication:

- **`adapters/DynamoDBUserRepository.ts`** - Real database implementation
  - Implements `IUserRepository` using AWS SDK v3
  - Translates between domain `User` entities and DynamoDB items
  - Handles AWS-specific errors and converts them to domain errors

- **`adapters/InMemoryUserRepository.ts`** - Testing implementation
  - Mock repository for fast unit testing
  - Uses in-memory Map for data storage
  - Same interface as DynamoDB version but no external dependencies

### Handlers (API Gateway Integration)

These connect API Gateway events to the business logic:

- **`handlers/create-user-handler.ts`** - POST /users endpoint
- **`handlers/get-user-handler.ts`** - GET /users/{userId} endpoint
- **`handlers/update-user-handler.ts`** - PUT /users/{userId} endpoint

Each handler:

1. Parses API Gateway events
2. Creates the appropriate repository (DynamoDB in production)
3. Creates and executes the use case
4. Returns properly formatted HTTP responses

### Shared Utilities

- **`shared/errors.ts`** - Domain error hierarchy with HTTP status mapping
- **`shared/logger.ts`** - Structured JSON logging for CloudWatch

## Architecture Benefits

**Why Hexagonal Architecture?**

1. **Testability** - Business logic has zero dependencies, making unit tests fast and reliable
2. **Flexibility** - Can swap data sources (DynamoDB ↔ InMemory ↔ RDS) without changing business logic
3. **Clear Separation** - Domain logic is protected from infrastructure changes
4. **Maintainability** - Each layer has a single responsibility

**Data Flow:**

```
API Gateway → Handler → Use Case → Repository Interface → Repository Implementation → DynamoDB
                  ↑         ↑              ↑                        ↑
                Domain   Business      Port/Contract         Adapter/Infrastructure
```

## Understanding Key Files

### `adapters/InMemoryUserRepository.ts`

This file is a **testing implementation** that mimics the real database. It:

- Implements the same `IUserRepository` interface as the real DynamoDB version
- Uses an in-memory Map instead of a real database
- Allows fast unit testing without any external dependencies
- Can be swapped in/out without changing any business logic

### Legacy vs New Architecture

- **Old**: API Gateway → VTL Templates → DynamoDB (tightly coupled)
- **New**: API Gateway → Lambda Handlers → Use Cases → Repository → DynamoDB (clean separation)

## CDK Infrastructure (`lib/`)

- **`user-login-service.ts`** - User authentication API and DynamoDB stack
  - Creates Lambda functions for each handler
  - Sets up API Gateway with proper authentication
  - Configures DynamoDB table with appropriate permissions

- **`s3-bucket-storage.ts`** - S3 bucket for lesson MP3 files

## Reference Documentation

- `../knowledge/hexagonal-architecture.md` - Detailed architecture guidelines
- `../HEXAGONAL-ARCHITECTURE-COMPLETE.md` - Migration documentation
- `../features/todo/done/` - Completed feature implementation details
