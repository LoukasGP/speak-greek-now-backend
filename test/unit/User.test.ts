import { User } from '../../lib/lambda/domain/entities/User';

describe('User Entity', () => {
  describe('Constructor and Validation', () => {
    it('should create a valid user', () => {
      const user = new User(
        'user-123',
        'test@example.com',
        'Test User',
        'https://example.com/pic.jpg',
        new Date('2026-01-01'),
        new Date('2026-01-02'),
        []
      );

      expect(user.userId).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.picture).toBe('https://example.com/pic.jpg');
      expect(user.completedLessons).toEqual([]);
    });

    it('should throw error for empty userId', () => {
      expect(() => {
        new User(
          '',
          'test@example.com',
          'Test User',
          '',
          new Date(),
          new Date(),
          []
        );
      }).toThrow('userId is required and cannot be empty');
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        new User(
          'user-123',
          'invalid-email',
          'Test User',
          '',
          new Date(),
          new Date(),
          []
        );
      }).toThrow('Valid email is required');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        new User(
          'user-123',
          'test@example.com',
          '',
          '',
          new Date(),
          new Date(),
          []
        );
      }).toThrow('name is required and cannot be empty');
    });

    it('should throw error for name longer than 200 characters', () => {
      const longName = 'a'.repeat(201);
      expect(() => {
        new User(
          'user-123',
          'test@example.com',
          longName,
          '',
          new Date(),
          new Date(),
          []
        );
      }).toThrow('name must be less than 200 characters');
    });
  });

  describe('Business Methods', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        'user-123',
        'test@example.com',
        'Test User',
        '',
        new Date('2026-01-01'),
        new Date('2026-01-02'),
        []
      );
    });

    describe('updateLastLogin', () => {
      it('should update last login timestamp', () => {
        const updatedUser = user.updateLastLogin();

        expect(updatedUser.userId).toBe(user.userId);
        expect(updatedUser.lastLoginAt.getTime()).toBeGreaterThan(
          user.lastLoginAt.getTime()
        );
      });

      it('should return a new instance (immutability)', () => {
        const updatedUser = user.updateLastLogin();
        expect(updatedUser).not.toBe(user);
      });
    });

    describe('addCompletedLesson', () => {
      it('should add a completed lesson', () => {
        const updatedUser = user.addCompletedLesson('lesson-1');

        expect(updatedUser.completedLessons).toHaveLength(1);
        expect(updatedUser.completedLessons[0].id).toBe('lesson-1');
        expect(updatedUser.completedLessons[0].at).toBeDefined();
      });

      it('should not add duplicate lesson', () => {
        const user1 = user.addCompletedLesson('lesson-1');
        const user2 = user1.addCompletedLesson('lesson-1');

        expect(user2.completedLessons).toHaveLength(1);
        expect(user2).toBe(user1);
      });

      it('should add multiple different lessons', () => {
        const user1 = user.addCompletedLesson('lesson-1');
        const user2 = user1.addCompletedLesson('lesson-2');

        expect(user2.completedLessons).toHaveLength(2);
        expect(user2.completedLessons[0].id).toBe('lesson-1');
        expect(user2.completedLessons[1].id).toBe('lesson-2');
      });
    });

    describe('hasCompletedLesson', () => {
      it('should return true for completed lesson', () => {
        const updatedUser = user.addCompletedLesson('lesson-1');
        expect(updatedUser.hasCompletedLesson('lesson-1')).toBe(true);
      });

      it('should return false for non-completed lesson', () => {
        expect(user.hasCompletedLesson('lesson-1')).toBe(false);
      });
    });

    describe('updateCompletedLessons', () => {
      it('should update completed lessons list', () => {
        const lessons = [
          { id: 'lesson-1', at: '2026-01-01T12:00:00Z' },
          { id: 'lesson-2', at: '2026-01-02T12:00:00Z' },
        ];

        const updatedUser = user.updateCompletedLessons(lessons);

        expect(updatedUser.completedLessons).toHaveLength(2);
        expect(updatedUser.completedLessons).toEqual(lessons);
      });
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON', () => {
      const user = new User(
        'user-123',
        'test@example.com',
        'Test User',
        'https://example.com/pic.jpg',
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-02T00:00:00Z'),
        [{ id: 'lesson-1', at: '2026-01-01T12:00:00Z' }]
      );

      const json = user.toJSON();

      expect(json).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
        createdAt: '2026-01-01T00:00:00.000Z',
        lastLoginAt: '2026-01-02T00:00:00.000Z',
        completedLessons: [{ id: 'lesson-1', at: '2026-01-01T12:00:00Z' }],
      });
    });

    it('should create from JSON', () => {
      const json = {
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        lastLoginAt: '2026-01-02T00:00:00Z',
        completedLessons: [{ id: 'lesson-1', at: '2026-01-01T12:00:00Z' }],
      };

      const user = User.fromJSON(json);

      expect(user.userId).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.completedLessons).toHaveLength(1);
    });
  });
});
