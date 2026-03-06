import { GetStoryProgressUseCase } from '../../lib/lambda/domain/use-cases/GetStoryProgressUseCase';
import { InMemoryStoryProgressRepository } from '../../lib/lambda/adapters/InMemoryStoryProgressRepository';
import { StoryProgress } from '../../lib/lambda/domain/entities/StoryProgress';
import { ValidationError, StoryProgressNotFoundError } from '../../lib/lambda/shared/errors';

describe('GetStoryProgressUseCase', () => {
  let repository: InMemoryStoryProgressRepository;
  let useCase: GetStoryProgressUseCase;

  beforeEach(() => {
    repository = new InMemoryStoryProgressRepository();
    useCase = new GetStoryProgressUseCase(repository);
  });

  it('returns progress when it exists', async () => {
    const progress = new StoryProgress(
      'google-oauth2|123',
      'corsairs-of-the-aegean',
      'piraeus-taverna',
      [],
      '2026-02-26T14:00:00.000Z',
      null
    );
    repository.seed(progress);

    const result = await useCase.execute('google-oauth2|123', 'corsairs-of-the-aegean');
    expect(result.userId).toBe('google-oauth2|123');
    expect(result.storyId).toBe('corsairs-of-the-aegean');
  });

  it('throws StoryProgressNotFoundError when no progress exists', async () => {
    await expect(
      useCase.execute('google-oauth2|123', 'corsairs-of-the-aegean')
    ).rejects.toThrow(StoryProgressNotFoundError);
  });

  it('throws ValidationError for empty userId', async () => {
    await expect(useCase.execute('', 'corsairs-of-the-aegean')).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError for empty storyId', async () => {
    await expect(useCase.execute('google-oauth2|123', '')).rejects.toThrow(ValidationError);
  });
});
