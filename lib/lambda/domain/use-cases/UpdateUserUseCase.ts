import { User, CompletedLesson } from '../entities/User';
import { IUserRepository } from '../ports/IUserRepository';
import { ValidationError, UserNotFoundError } from '../../shared/errors';

export interface UpdateUserInput {
  userId: string;
  lastLoginAt?: string;
  completedLessons?: CompletedLesson[];
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateUserInput): Promise<User> {
    this.validateInput(input);

    const existingUser = await this.userRepository.getUserById(input.userId);
    if (!existingUser) {
      throw new UserNotFoundError(input.userId);
    }

    let updatedUser = existingUser;

    if (input.lastLoginAt) {
      updatedUser = new User(
        updatedUser.userId,
        updatedUser.email,
        updatedUser.name,
        updatedUser.picture,
        updatedUser.createdAt,
        new Date(input.lastLoginAt),
        updatedUser.completedLessons
      );
    }

    if (input.completedLessons !== undefined) {
      updatedUser = updatedUser.updateCompletedLessons(input.completedLessons);
    }

    return await this.userRepository.updateUser(updatedUser);
  }

  async updateLastLogin(userId: string): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }

    const exists = await this.userRepository.userExists(userId);
    if (!exists) {
      throw new UserNotFoundError(userId);
    }

    await this.userRepository.updateLastLogin(userId);
  }

  async addCompletedLesson(userId: string, lessonId: string): Promise<User> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }

    if (!lessonId || lessonId.trim().length === 0) {
      throw new ValidationError('lessonId is required');
    }

    const existingUser = await this.userRepository.getUserById(userId);
    if (!existingUser) {
      throw new UserNotFoundError(userId);
    }

    const updatedUser = existingUser.addCompletedLesson(lessonId);

    if (updatedUser !== existingUser) {
      return await this.userRepository.updateUser(updatedUser);
    }

    return existingUser;
  }

  private validateInput(input: UpdateUserInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }

    if (!input.lastLoginAt && input.completedLessons === undefined) {
      throw new ValidationError(
        'At least one field must be provided for update (lastLoginAt or completedLessons)'
      );
    }
  }
}
