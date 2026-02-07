import { UpdateUserUseCase } from '../../lib/lambda/domain/use-cases/UpdateUserUseCase';
import { InMemoryUserRepository } from '../../lib/lambda/adapters/InMemoryUserRepository';
import { User } from '../../lib/lambda/domain/entities/User';
import { ValidationError, UserNotFoundError } from '../../lib/lambda/shared/errors';

describe('UpdateUserUseCase', () => {
  let repository: InMemoryUserRepository;
  let useCase: UpdateUserUseCase;
  let testUser: User;

  beforeEach(async () => {
    repository = new InMemoryUserRepository();
    useCase = new UpdateUserUseCase(repository);

    testUser = new User(
      'user-123',
      'test@example.com',
      'Test User',
      '',
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      []
    );
    await repository.createUser(testUser);
  });

  describe('execute', () => {
    it('should update lastLoginAt', async () => {
      const input = {
        userId: 'user-123',
        lastLoginAt: '2026-02-01T12:00:00Z',
      };

      const updated = await useCase.execute(input);

      expect(updated.lastLoginAt.toISOString()).toBe('2026-02-01T12:00:00.000Z');
    });

    it('should update completedLessons', async () => {
      const input = {
        userId: 'user-123',
        completedLessons: [
          { id: 'lesson-1', at: '2026-01-01T12:00:00Z' },
          { id: 'lesson-2', at: '2026-01-02T12:00:00Z' },
        ],
      };

      const updated = await useCase.execute(input);

      expect(updated.completedLessons).toHaveLength(2);
      expect(updated.completedLessons[0].id).toBe('lesson-1');
    });

    it('should update both fields', async () => {
      const input = {
        userId: 'user-123',
        lastLoginAt: '2026-02-01T12:00:00Z',
        completedLessons: [{ id: 'lesson-1', at: '2026-01-01T12:00:00Z' }],
      };

      const updated = await useCase.execute(input);

      expect(updated.lastLoginAt.toISOString()).toBe('2026-02-01T12:00:00.000Z');
      expect(updated.completedLessons).toHaveLength(1);
    });

    it('should throw ValidationError for empty userId', async () => {
      const input = {
        userId: '',
        lastLoginAt: '2026-02-01T12:00:00Z',
      };

      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when no fields to update', async () => {
      const input = {
        userId: 'user-123',
      };

      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(input)).rejects.toThrow('At least one field must be provided');
    });

    it('should throw UserNotFoundError for non-existent user', async () => {
      const input = {
        userId: 'non-existent',
        lastLoginAt: '2026-02-01T12:00:00Z',
      };

      await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login for existing user', async () => {
      await useCase.updateLastLogin('user-123');

      const user = await repository.getUserById('user-123');
      expect(user).not.toBeNull();
      expect(user!.lastLoginAt.getTime()).toBeGreaterThan(testUser.lastLoginAt.getTime());
    });

    it('should throw ValidationError for empty userId', async () => {
      await expect(useCase.updateLastLogin('')).rejects.toThrow(ValidationError);
    });

    it('should throw UserNotFoundError for non-existent user', async () => {
      await expect(useCase.updateLastLogin('non-existent')).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('addCompletedLesson', () => {
    it('should add a completed lesson', async () => {
      const updated = await useCase.addCompletedLesson('user-123', 'lesson-1');

      expect(updated.completedLessons).toHaveLength(1);
      expect(updated.completedLessons[0].id).toBe('lesson-1');
    });

    it('should not add duplicate lesson', async () => {
      await useCase.addCompletedLesson('user-123', 'lesson-1');
      const updated = await useCase.addCompletedLesson('user-123', 'lesson-1');

      expect(updated.completedLessons).toHaveLength(1);
    });

    it('should throw ValidationError for empty userId', async () => {
      await expect(useCase.addCompletedLesson('', 'lesson-1')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty lessonId', async () => {
      await expect(useCase.addCompletedLesson('user-123', '')).rejects.toThrow(ValidationError);
    });

    it('should throw UserNotFoundError for non-existent user', async () => {
      await expect(useCase.addCompletedLesson('non-existent', 'lesson-1')).rejects.toThrow(
        UserNotFoundError
      );
    });
  });
});
