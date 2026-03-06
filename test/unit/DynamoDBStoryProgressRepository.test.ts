import { DynamoDBStoryProgressRepository } from '../../lib/lambda/adapters/DynamoDBStoryProgressRepository';
import { StoryProgress } from '../../lib/lambda/domain/entities/StoryProgress';
import { RepositoryError } from '../../lib/lambda/shared/errors';

describe('DynamoDBStoryProgressRepository - Item Translation', () => {
  describe('toDynamoDBItem()', () => {
    it('produces correct shape with all fields', () => {
      const progress = new StoryProgress(
        'google-oauth2|123',
        'corsairs-of-the-aegean',
        'meeting-the-captain',
        [{ checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' }],
        '2026-02-26T14:00:00.000Z',
        null
      );

      const repo = new (DynamoDBStoryProgressRepository as any)('test-table');
      const item = repo.toDynamoDBItem(progress);

      expect(item.userId).toBe('google-oauth2|123');
      expect(item.storyId).toBe('corsairs-of-the-aegean');
      expect(item.currentCheckpointId).toBe('meeting-the-captain');
      expect(item.checkpointsCompleted).toHaveLength(1);
      expect(item.checkpointsCompleted[0].checkpointId).toBe('piraeus-taverna');
      expect(item.startedAt).toBe('2026-02-26T14:00:00.000Z');
      expect(item.completedAt).toBeNull();
    });

    it('handles null completedAt', () => {
      const progress = new StoryProgress(
        'user-1',
        'story-1',
        'cp-1',
        [],
        '2026-02-26T14:00:00.000Z',
        null
      );

      const repo = new (DynamoDBStoryProgressRepository as any)('test-table');
      const item = repo.toDynamoDBItem(progress);

      expect(item.completedAt).toBeNull();
    });
  });

  describe('fromDynamoDBItem()', () => {
    it('creates valid StoryProgress entity', () => {
      const item = {
        userId: 'google-oauth2|123',
        storyId: 'corsairs-of-the-aegean',
        currentCheckpointId: 'meeting-the-captain',
        checkpointsCompleted: [
          { checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' },
        ],
        startedAt: '2026-02-26T14:00:00.000Z',
        completedAt: null,
      };

      const repo = new (DynamoDBStoryProgressRepository as any)('test-table');
      const progress = repo.fromDynamoDBItem(item);

      expect(progress).toBeInstanceOf(StoryProgress);
      expect(progress.userId).toBe('google-oauth2|123');
      expect(progress.checkpointsCompleted).toHaveLength(1);
    });

    it('handles missing checkpointsCompleted', () => {
      const item = {
        userId: 'user-1',
        storyId: 'story-1',
        currentCheckpointId: 'cp-1',
        startedAt: '2026-02-26T14:00:00.000Z',
      };

      const repo = new (DynamoDBStoryProgressRepository as any)('test-table');
      const progress = repo.fromDynamoDBItem(item);

      expect(progress.checkpointsCompleted).toEqual([]);
    });

    it('handles missing completedAt', () => {
      const item = {
        userId: 'user-1',
        storyId: 'story-1',
        currentCheckpointId: 'cp-1',
        startedAt: '2026-02-26T14:00:00.000Z',
      };

      const repo = new (DynamoDBStoryProgressRepository as any)('test-table');
      const progress = repo.fromDynamoDBItem(item);

      expect(progress.completedAt).toBeNull();
    });

    it('throws for corrupted data (missing required keys)', () => {
      const repo = new (DynamoDBStoryProgressRepository as any)('test-table');

      expect(() => repo.fromDynamoDBItem({ storyId: 'story-1' })).toThrow(RepositoryError);
      expect(() =>
        repo.fromDynamoDBItem({
          userId: 'user-1',
          storyId: 'story-1',
        })
      ).toThrow(RepositoryError);
    });
  });
});
