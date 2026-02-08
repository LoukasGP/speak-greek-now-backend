export interface CompletedLesson {
  id: string;
  at: string;
}

export class User {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly picture: string,
    public readonly createdAt: Date,
    public lastLoginAt: Date,
    public readonly completedLessons: CompletedLesson[] = []
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error('userId is required and cannot be empty');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Valid email is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('name is required and cannot be empty');
    }

    if (this.name.length > 200) {
      throw new Error('name must be less than 200 characters');
    }

    if (!this.createdAt || !(this.createdAt instanceof Date)) {
      throw new Error('createdAt must be a valid Date');
    }

    if (!this.lastLoginAt || !(this.lastLoginAt instanceof Date)) {
      throw new Error('lastLoginAt must be a valid Date');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  updateLastLogin(): User {
    return new User(
      this.userId,
      this.email,
      this.name,
      this.picture,
      this.createdAt,
      new Date(),
      this.completedLessons
    );
  }

  addCompletedLesson(lessonId: string): User {
    if (this.hasCompletedLesson(lessonId)) {
      return this;
    }

    const newLesson: CompletedLesson = {
      id: lessonId,
      at: new Date().toISOString(),
    };

    return new User(
      this.userId,
      this.email,
      this.name,
      this.picture,
      this.createdAt,
      this.lastLoginAt,
      [...this.completedLessons, newLesson]
    );
  }

  hasCompletedLesson(lessonId: string): boolean {
    return this.completedLessons.some((lesson) => lesson.id === lessonId);
  }

  updateCompletedLessons(lessons: CompletedLesson[]): User {
    return new User(
      this.userId,
      this.email,
      this.name,
      this.picture,
      this.createdAt,
      this.lastLoginAt,
      lessons
    );
  }

  toJSON() {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
      picture: this.picture,
      createdAt: this.createdAt.toISOString(),
      lastLoginAt: this.lastLoginAt.toISOString(),
      completedLessons: this.completedLessons,
    };
  }

  static fromJSON(data: any): User {
    return new User(
      data.userId,
      data.email,
      data.name,
      data.picture || '',
      new Date(data.createdAt),
      new Date(data.lastLoginAt),
      data.completedLessons || []
    );
  }
}
