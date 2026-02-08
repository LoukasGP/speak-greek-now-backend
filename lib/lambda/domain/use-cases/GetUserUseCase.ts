import { User } from '../entities/User';
import { IUserRepository } from '../ports/IUserRepository';
import { UserNotFoundError } from '../../shared/errors';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    if (!userId || userId.trim().length === 0) {
      throw new UserNotFoundError(userId);
    }

    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return user;
  }

  async findById(userId: string): Promise<User | null> {
    if (!userId || userId.trim().length === 0) {
      return null;
    }

    return await this.userRepository.getUserById(userId);
  }
}
