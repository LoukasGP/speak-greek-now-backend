export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(userId: string) {
    super(`User with ID ${userId} already exists`, 'USER_ALREADY_EXISTS', 400);
  }
}

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, 'USER_NOT_FOUND', 404);
  }
}

export class RepositoryError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Repository operation failed: ${message}`, 'REPOSITORY_ERROR', 500);
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}
