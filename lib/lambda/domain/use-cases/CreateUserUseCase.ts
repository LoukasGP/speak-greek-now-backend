import { User } from '../entities/User';
import { IUserRepository } from '../ports/IUserRepository';
import { ValidationError, UserAlreadyExistsError } from '../../shared/errors';

export interface CreateUserInput {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    this.validateInput(input);

    const existingUser = await this.userRepository.getUserById(input.userId);
    if (existingUser) {
      throw new UserAlreadyExistsError(input.userId);
    }

    const user = new User(
      input.userId,
      input.email,
      input.name,
      input.picture || '',
      input.createdAt ? new Date(input.createdAt) : new Date(),
      input.lastLoginAt ? new Date(input.lastLoginAt) : new Date(),
      []
    );

    return await this.userRepository.createUser(user);
  }

  private validateInput(input: CreateUserInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new ValidationError('userId is required');
    }

    if (!input.email || input.email.trim().length === 0) {
      throw new ValidationError('email is required');
    }

    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('name is required');
    }
  }
}
