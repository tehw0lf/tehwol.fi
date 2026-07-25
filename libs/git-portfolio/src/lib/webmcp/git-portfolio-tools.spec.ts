import { of } from 'rxjs';

import {
  createGitPortfolioTools,
  ToolRepositories
} from './git-portfolio-tools';
import { ModelContextTool } from './model-context';

function repositories(): ToolRepositories {
  return {
    github: {
      own: [
        {
          name: 'alpha',
          language: 'TypeScript',
          stargazers_count: 10,
          html_url: 'https://github.com/tehw0lf/alpha'
        },
        {
          name: 'beta',
          language: 'Python',
          stargazers_count: 30,
          html_url: 'https://github.com/tehw0lf/beta'
        },
        {
          name: 'gamma',
          language: 'TypeScript',
          stargazers_count: 20,
          html_url: 'https://github.com/tehw0lf/gamma'
        }
      ],
      forked: [{ name: 'forked-one', language: 'Go', stargazers_count: 5 }]
    }
  };
}

function toolByName(
  tools: readonly ModelContextTool<never>[],
  name: string
): ModelContextTool<never> {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`tool ${name} not registered`);
  }
  return tool;
}

describe('git portfolio webmcp tools', () => {
  let calls: number;
  let tools: readonly ModelContextTool<never>[];

  beforeEach(() => {
    calls = 0;
    tools = createGitPortfolioTools({
      getRepositories: () => {
        calls++;
        return of(repositories());
      }
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const run = (name: string, input: any): Promise<any> =>
    toolByName(tools, name).execute(input) as Promise<never>;

  it('should list own repositories sorted by stars', async () => {
    const result = await run('git_portfolio_list', {});

    expect(result.repositories.map((r: { name: string }) => r.name)).toEqual([
      'beta',
      'gamma',
      'alpha'
    ]);
    expect(result.truncated).toBe(false);
  });

  it('should exclude forks unless asked', async () => {
    const withoutForks = await run('git_portfolio_list', {});
    expect(
      withoutForks.repositories.some((r: { kind: string }) => r.kind === 'forked')
    ).toBe(false);

    const withForks = await run('git_portfolio_list', { includeForks: true });
    expect(
      withForks.repositories.some((r: { kind: string }) => r.kind === 'forked')
    ).toBe(true);
  });

  it('should filter by language', async () => {
    const result = await run('git_portfolio_list', { language: 'typescript' });

    expect(result.repositories.map((r: { name: string }) => r.name)).toEqual([
      'gamma',
      'alpha'
    ]);
  });

  it('should cap results and report truncation', async () => {
    const result = await run('git_portfolio_list', { limit: 1 });

    expect(result.returned).toBe(1);
    expect(result.total).toBe(3);
    expect(result.truncated).toBe(true);
  });

  it('should summarise languages', async () => {
    const result = await run('git_portfolio_languages', {});

    expect(result.languages).toEqual([
      { language: 'TypeScript', repositories: 2 },
      { language: 'Python', repositories: 1 }
    ]);
  });

  it('should read through the provided source so its cache applies', async () => {
    await run('git_portfolio_list', {});
    await run('git_portfolio_languages', {});

    // Each call delegates to GitProviderService, which caches for ten minutes;
    // the tools add no second uncached path to the provider APIs.
    expect(calls).toBe(2);
  });

  it('should be annotated as read only and externally sourced', () => {
    tools.forEach((tool) => {
      expect(tool.annotations?.readOnlyHint).toBe(true);
      expect(tool.annotations?.untrustedContentHint).toBe(true);
    });
  });
});
