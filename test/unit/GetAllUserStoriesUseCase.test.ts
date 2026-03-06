import { GetAllUserStoriesUseCase } from '../../lib/lambda/domain/use-cases/GetAllUserStoriesUseCase';
import { InMemoryStoryProgressRepository } from '../../lib/lambda/adapters/InMemoryStoryProgressRepository';
import { StoryProgress } from '../../lib/lambda/domain/entities/StoryProgress';
import { ValidationError } from '../../lib/lambda/shared/errors';

describe('GetAllUserStoriesUseCase', () => {
  let repository: InMemoryStoryProgressRepository;
  let useCase: GetAllUserStoriesUseCase;

  beforeEach(() => {
    repository = new InMemoryStoryProgressRepository();
    useCase = new GetAllUserStoriesUseCase(repository);
  });

  it('returns all story progress for a user', async () => {
    const progress1 = new StoryProgress(
      'google-oauth2|123',
      'corsairs-of-the-aegean',
      'piraeus-taverna',
      [],
      '2026-02-26T14:00:00.000Z',
      null
    );
    const progress2 = new StoryProgress(
      'google-oauth2|123',
      'another-story',
      'chapter-1',
      [],
      '2026-02-27T10:00:00.000Z',
      null
    );
    repository.seed(progress1);
    repository.seed(progress2);

    const result = await useCase.execute('google-oauth2|123');
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no progress exists', async () => {
    const result = await useCase.execute('google-oauth2|123');
    expect(result).toEqual([]);
  });

  it('throws ValidationError for empty userId', async () => {
    await expect(useCase.execute('')).rejects.toThrow(ValidationError);
  });
});
