import { CreateUserUseCase } from '../../lib/lambda/domain/use-cases/CreateUserUseCase';
import { InMemoryUserRepository } from '../../lib/lambda/adapters/InMemoryUserRepository';
import { ValidationError, UserAlreadyExistsError } from '../../lib/lambda/shared/errors';

describe('CreateUserUseCase', () => {
  let repository: InMemoryUserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new CreateUserUseCase(repository);
  });

  it('should create a new user successfully', async () => {
    const input = {
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg',
    };

    const user = await useCase.execute(input);

    expect(user.userId).toBe('user-123');
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
    expect(user.picture).toBe('https://example.com/pic.jpg');
    expect(user.completedLessons).toEqual([]);
  });

  it('should create user with default timestamps', async () => {
    const input = {
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    const user = await useCase.execute(input);

    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.lastLoginAt).toBeInstanceOf(Date);
  });

  it('should create user with provided timestamps', async () => {
    const input = {
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: '2026-01-01T00:00:00Z',
      lastLoginAt: '2026-01-02T00:00:00Z',
    };

    const user = await useCase.execute(input);

    expect(user.createdAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(user.lastLoginAt.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  it('should throw ValidationError for missing userId', async () => {
    const input = {
      userId: '',
      email: 'test@example.com',
      name: 'Test User',
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    await expect(useCase.execute(input)).rejects.toThrow('userId is required');
  });

  it('should throw ValidationError for missing email', async () => {
    const input = {
      userId: 'user-123',
      email: '',
      name: 'Test User',
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    await expect(useCase.execute(input)).rejects.toThrow('email is required');
  });

  it('should throw ValidationError for missing name', async () => {
    const input = {
      userId: 'user-123',
      email: 'test@example.com',
      name: '',
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    await expect(useCase.execute(input)).rejects.toThrow('name is required');
  });

  it('should throw UserAlreadyExistsError for duplicate user', async () => {
    const input = {
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    await useCase.execute(input);

    await expect(useCase.execute(input)).rejects.toThrow(UserAlreadyExistsError);
  });

  it('should throw error for invalid email format', async () => {
    const input = {
      userId: 'user-123',
      email: 'invalid-email',
      name: 'Test User',
    };

    await expect(useCase.execute(input)).rejects.toThrow('Valid email is required');
  });
});
