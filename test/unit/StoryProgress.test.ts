import { StoryProgress } from '../../lib/lambda/domain/entities/StoryProgress';
import { ValidationError } from '../../lib/lambda/shared/errors';

describe('StoryProgress Entity', () => {
  const baseParams = {
    userId: 'google-oauth2|123',
    storyId: 'corsairs-of-the-aegean',
    currentCheckpointId: 'piraeus-taverna',
    checkpointsCompleted: [] as { checkpointId: string; completedAt: string }[],
    startedAt: '2026-02-26T14:00:00.000Z',
    completedAt: null as string | null,
  };

  describe('createNew()', () => {
    it('creates a new StoryProgress with correct defaults', () => {
      const progress = StoryProgress.createNew(
        'google-oauth2|123',
        'corsairs-of-the-aegean',
        'piraeus-taverna'
      );

      expect(progress.userId).toBe('google-oauth2|123');
      expect(progress.storyId).toBe('corsairs-of-the-aegean');
      expect(progress.currentCheckpointId).toBe('piraeus-taverna');
      expect(progress.checkpointsCompleted).toEqual([]);
      expect(progress.startedAt).toBeDefined();
      expect(progress.completedAt).toBeNull();
    });
  });

  describe('markCheckpointComplete()', () => {
    it('adds checkpoint to completed list', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        baseParams.currentCheckpointId,
        baseParams.checkpointsCompleted,
        baseParams.startedAt,
        baseParams.completedAt
      );

      const updated = progress.markCheckpointComplete(
        'piraeus-taverna',
        '2026-02-26T14:30:00.000Z',
        'meeting-the-captain'
      );

      expect(updated.checkpointsCompleted).toHaveLength(1);
      expect(updated.checkpointsCompleted[0].checkpointId).toBe('piraeus-taverna');
      expect(updated.checkpointsCompleted[0].completedAt).toBe('2026-02-26T14:30:00.000Z');
    });

    it('advances currentCheckpointId to next', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        baseParams.currentCheckpointId,
        baseParams.checkpointsCompleted,
        baseParams.startedAt,
        baseParams.completedAt
      );

      const updated = progress.markCheckpointComplete(
        'piraeus-taverna',
        '2026-02-26T14:30:00.000Z',
        'meeting-the-captain'
      );

      expect(updated.currentCheckpointId).toBe('meeting-the-captain');
    });

    it('sets completedAt when nextCheckpointId is null (final checkpoint)', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        'final-checkpoint',
        [{ checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' }],
        baseParams.startedAt,
        baseParams.completedAt
      );

      const updated = progress.markCheckpointComplete(
        'final-checkpoint',
        '2026-02-26T15:00:00.000Z',
        null
      );

      expect(updated.completedAt).toBe('2026-02-26T15:00:00.000Z');
      expect(updated.isStoryComplete()).toBe(true);
    });

    it('is idempotent for duplicate checkpoint', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        'meeting-the-captain',
        [{ checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' }],
        baseParams.startedAt,
        baseParams.completedAt
      );

      const updated = progress.markCheckpointComplete(
        'piraeus-taverna',
        '2026-02-26T14:30:00.000Z',
        'meeting-the-captain'
      );

      expect(updated).toBe(progress);
      expect(updated.checkpointsCompleted).toHaveLength(1);
    });
  });

  describe('hasCompletedCheckpoint()', () => {
    it('returns true for completed checkpoint', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        'meeting-the-captain',
        [{ checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' }],
        baseParams.startedAt,
        baseParams.completedAt
      );

      expect(progress.hasCompletedCheckpoint('piraeus-taverna')).toBe(true);
    });

    it('returns false for not completed checkpoint', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        baseParams.currentCheckpointId,
        baseParams.checkpointsCompleted,
        baseParams.startedAt,
        baseParams.completedAt
      );

      expect(progress.hasCompletedCheckpoint('piraeus-taverna')).toBe(false);
    });
  });

  describe('getCompletionCount()', () => {
    it('returns correct count', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        'checkpoint-3',
        [
          { checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' },
          { checkpointId: 'meeting-the-captain', completedAt: '2026-02-26T15:00:00.000Z' },
        ],
        baseParams.startedAt,
        baseParams.completedAt
      );

      expect(progress.getCompletionCount()).toBe(2);
    });
  });

  describe('isStoryComplete()', () => {
    it('returns false when in progress', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        baseParams.currentCheckpointId,
        baseParams.checkpointsCompleted,
        baseParams.startedAt,
        null
      );

      expect(progress.isStoryComplete()).toBe(false);
    });

    it('returns true when finished', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        baseParams.currentCheckpointId,
        baseParams.checkpointsCompleted,
        baseParams.startedAt,
        '2026-02-26T16:00:00.000Z'
      );

      expect(progress.isStoryComplete()).toBe(true);
    });
  });

  describe('toJSON() / fromJSON()', () => {
    it('toJSON includes all fields', () => {
      const progress = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        baseParams.currentCheckpointId,
        [{ checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' }],
        baseParams.startedAt,
        null
      );

      const json = progress.toJSON();
      expect(json.userId).toBe(baseParams.userId);
      expect(json.storyId).toBe(baseParams.storyId);
      expect(json.currentCheckpointId).toBe(baseParams.currentCheckpointId);
      expect(json.startedAt).toBe(baseParams.startedAt);
      expect(json.completedAt).toBeNull();
      expect(json.checkpointsCompleted).toHaveLength(1);
    });

    it('round-trips correctly', () => {
      const original = new StoryProgress(
        baseParams.userId,
        baseParams.storyId,
        baseParams.currentCheckpointId,
        [{ checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' }],
        baseParams.startedAt,
        null
      );

      const json = original.toJSON();
      const restored = StoryProgress.fromJSON(json);

      expect(restored.userId).toBe(original.userId);
      expect(restored.storyId).toBe(original.storyId);
      expect(restored.currentCheckpointId).toBe(original.currentCheckpointId);
      expect(restored.checkpointsCompleted).toEqual(original.checkpointsCompleted);
      expect(restored.startedAt).toBe(original.startedAt);
      expect(restored.completedAt).toBe(original.completedAt);
    });

    it('fromJSON handles missing optional fields', () => {
      const restored = StoryProgress.fromJSON({
        userId: 'test-user',
        storyId: 'test-story',
        currentCheckpointId: 'cp-1',
        startedAt: '2026-02-26T14:00:00.000Z',
      });

      expect(restored.checkpointsCompleted).toEqual([]);
      expect(restored.completedAt).toBeNull();
    });
  });

  describe('validation', () => {
    it('throws ValidationError for empty userId', () => {
      expect(
        () =>
          new StoryProgress(
            '',
            baseParams.storyId,
            baseParams.currentCheckpointId,
            baseParams.checkpointsCompleted,
            baseParams.startedAt,
            baseParams.completedAt
          )
      ).toThrow(ValidationError);
    });

    it('throws ValidationError for empty storyId', () => {
      expect(
        () =>
          new StoryProgress(
            baseParams.userId,
            '',
            baseParams.currentCheckpointId,
            baseParams.checkpointsCompleted,
            baseParams.startedAt,
            baseParams.completedAt
          )
      ).toThrow(ValidationError);
    });

    it('throws ValidationError for empty currentCheckpointId', () => {
      expect(
        () =>
          new StoryProgress(
            baseParams.userId,
            baseParams.storyId,
            '',
            baseParams.checkpointsCompleted,
            baseParams.startedAt,
            baseParams.completedAt
          )
      ).toThrow(ValidationError);
    });

    it('throws ValidationError for empty startedAt', () => {
      expect(
        () =>
          new StoryProgress(
            baseParams.userId,
            baseParams.storyId,
            baseParams.currentCheckpointId,
            baseParams.checkpointsCompleted,
            '',
            baseParams.completedAt
          )
      ).toThrow(ValidationError);
    });
  });
});
