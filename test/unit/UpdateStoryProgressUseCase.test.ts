import { UpdateStoryProgressUseCase } from '../../lib/lambda/domain/use-cases/UpdateStoryProgressUseCase';
import { InMemoryStoryProgressRepository } from '../../lib/lambda/adapters/InMemoryStoryProgressRepository';
import { StoryProgress } from '../../lib/lambda/domain/entities/StoryProgress';
import { ValidationError } from '../../lib/lambda/shared/errors';

describe('UpdateStoryProgressUseCase', () => {
  let repository: InMemoryStoryProgressRepository;
  let useCase: UpdateStoryProgressUseCase;

  beforeEach(() => {
    repository = new InMemoryStoryProgressRepository();
    useCase = new UpdateStoryProgressUseCase(repository);
  });

  it('creates new progress on first checkpoint completion', async () => {
    const result = await useCase.execute({
      userId: 'google-oauth2|123',
      storyId: 'corsairs-of-the-aegean',
      checkpointId: 'piraeus-taverna',
      nextCheckpointId: 'meeting-the-captain',
      completedAt: '2026-02-26T14:30:00.000Z',
    });

    expect(result.userId).toBe('google-oauth2|123');
    expect(result.storyId).toBe('corsairs-of-the-aegean');
    expect(result.currentCheckpointId).toBe('meeting-the-captain');
    expect(result.checkpointsCompleted).toHaveLength(1);
    expect(result.checkpointsCompleted[0].checkpointId).toBe('piraeus-taverna');
  });

  it('updates existing progress with next checkpoint', async () => {
    const existing = new StoryProgress(
      'google-oauth2|123',
      'corsairs-of-the-aegean',
      'meeting-the-captain',
      [{ checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' }],
      '2026-02-26T14:00:00.000Z',
      null
    );
    repository.seed(existing);

    const result = await useCase.execute({
      userId: 'google-oauth2|123',
      storyId: 'corsairs-of-the-aegean',
      checkpointId: 'meeting-the-captain',
      nextCheckpointId: 'the-voyage-begins',
      completedAt: '2026-02-26T15:00:00.000Z',
    });

    expect(result.checkpointsCompleted).toHaveLength(2);
    expect(result.currentCheckpointId).toBe('the-voyage-begins');
  });

  it('handles final checkpoint (sets story completedAt)', async () => {
    const existing = new StoryProgress(
      'google-oauth2|123',
      'corsairs-of-the-aegean',
      'final-battle',
      [{ checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' }],
      '2026-02-26T14:00:00.000Z',
      null
    );
    repository.seed(existing);

    const result = await useCase.execute({
      userId: 'google-oauth2|123',
      storyId: 'corsairs-of-the-aegean',
      checkpointId: 'final-battle',
      nextCheckpointId: null,
      completedAt: '2026-02-26T16:00:00.000Z',
    });

    expect(result.isStoryComplete()).toBe(true);
    expect(result.completedAt).toBe('2026-02-26T16:00:00.000Z');
  });

  it('duplicate checkpoint completion is idempotent', async () => {
    const existing = new StoryProgress(
      'google-oauth2|123',
      'corsairs-of-the-aegean',
      'meeting-the-captain',
      [{ checkpointId: 'piraeus-taverna', completedAt: '2026-02-26T14:30:00.000Z' }],
      '2026-02-26T14:00:00.000Z',
      null
    );
    repository.seed(existing);

    const result = await useCase.execute({
      userId: 'google-oauth2|123',
      storyId: 'corsairs-of-the-aegean',
      checkpointId: 'piraeus-taverna',
      nextCheckpointId: 'meeting-the-captain',
      completedAt: '2026-02-26T14:30:00.000Z',
    });

    expect(result.checkpointsCompleted).toHaveLength(1);
  });

  it('throws ValidationError for empty required fields', async () => {
    await expect(
      useCase.execute({
        userId: '',
        storyId: 'corsairs-of-the-aegean',
        checkpointId: 'piraeus-taverna',
        nextCheckpointId: 'meeting-the-captain',
        completedAt: '2026-02-26T14:30:00.000Z',
      })
    ).rejects.toThrow(ValidationError);

    await expect(
      useCase.execute({
        userId: 'google-oauth2|123',
        storyId: '',
        checkpointId: 'piraeus-taverna',
        nextCheckpointId: 'meeting-the-captain',
        completedAt: '2026-02-26T14:30:00.000Z',
      })
    ).rejects.toThrow(ValidationError);

    await expect(
      useCase.execute({
        userId: 'google-oauth2|123',
        storyId: 'corsairs-of-the-aegean',
        checkpointId: '',
        nextCheckpointId: 'meeting-the-captain',
        completedAt: '2026-02-26T14:30:00.000Z',
      })
    ).rejects.toThrow(ValidationError);
  });

  it('saves updated progress to repository', async () => {
    await useCase.execute({
      userId: 'google-oauth2|123',
      storyId: 'corsairs-of-the-aegean',
      checkpointId: 'piraeus-taverna',
      nextCheckpointId: 'meeting-the-captain',
      completedAt: '2026-02-26T14:30:00.000Z',
    });

    const saved = await repository.getProgress('google-oauth2|123', 'corsairs-of-the-aegean');
    expect(saved).not.toBeNull();
    expect(saved!.checkpointsCompleted).toHaveLength(1);
  });
});
