import { User } from '../domain/entities/User';
import { IUserRepository } from '../domain/ports/IUserRepository';
import { UserAlreadyExistsError, UserNotFoundError } from '../shared/errors';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async getUserById(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async createUser(user: User): Promise<User> {
    if (this.users.has(user.userId)) {
      throw new UserAlreadyExistsError(user.userId);
    }

    this.users.set(user.userId, user);
    return user;
  }

  async updateUser(user: User): Promise<User> {
    if (!this.users.has(user.userId)) {
      throw new UserNotFoundError(user.userId);
    }

    this.users.set(user.userId, user);
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const updatedUser = user.updateLastLogin();
    this.users.set(userId, updatedUser);
  }

  async userExists(userId: string): Promise<boolean> {
    return this.users.has(userId);
  }

  async deleteUser(userId: string): Promise<void> {
    const exists = await this.userExists(userId);
    if (!exists) {
      throw new UserNotFoundError(userId);
    }
    this.users.delete(userId);
  }

  clear(): void {
    this.users.clear();
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  count(): number {
    return this.users.size;
  }
}
