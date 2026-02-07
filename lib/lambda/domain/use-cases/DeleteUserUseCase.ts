import { IUserRepository } from '../ports/IUserRepository';
import { UserNotFoundError } from '../../shared/errors';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new UserNotFoundError(userId);
    }

    const userExists = await this.userRepository.userExists(userId);

    if (!userExists) {
      throw new UserNotFoundError(userId);
    }

    await this.userRepository.deleteUser(userId);
  }
}
