import { GetUserUseCase } from '../../lib/lambda/domain/use-cases/GetUserUseCase';
import { InMemoryUserRepository } from '../../lib/lambda/adapters/InMemoryUserRepository';
import { User } from '../../lib/lambda/domain/entities/User';
import { UserNotFoundError } from '../../lib/lambda/shared/errors';

describe('GetUserUseCase', () => {
  let repository: InMemoryUserRepository;
  let useCase: GetUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new GetUserUseCase(repository);
  });

  it('should retrieve an existing user', async () => {
    const user = new User(
      'user-123',
      'test@example.com',
      'Test User',
      '',
      new Date(),
      new Date(),
      []
    );
    await repository.createUser(user);

    const retrieved = await useCase.execute('user-123');

    expect(retrieved.userId).toBe('user-123');
    expect(retrieved.email).toBe('test@example.com');
  });

  it('should throw UserNotFoundError for non-existent user', async () => {
    await expect(useCase.execute('non-existent')).rejects.toThrow(UserNotFoundError);
  });

  it('should throw UserNotFoundError for empty userId', async () => {
    await expect(useCase.execute('')).rejects.toThrow(UserNotFoundError);
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      const user = new User(
        'user-123',
        'test@example.com',
        'Test User',
        '',
        new Date(),
        new Date(),
        []
      );
      await repository.createUser(user);

      const result = await useCase.findById('user-123');

      expect(result).not.toBeNull();
      expect(result?.userId).toBe('user-123');
    });

    it('should return null if user not found', async () => {
      const result = await useCase.findById('non-existent');
      expect(result).toBeNull();
    });

    it('should return null for empty userId', async () => {
      const result = await useCase.findById('');
      expect(result).toBeNull();
    });
  });
});
