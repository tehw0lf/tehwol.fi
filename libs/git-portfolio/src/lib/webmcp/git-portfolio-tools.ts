import { firstValueFrom, Observable } from 'rxjs';

import { ModelContextTool } from './model-context';

/**
 * Structural subset of the library's GitRepository, GitRepositories and
 * GitProviderConfig types.
 *
 * This is a secondary entry point, so it cannot reach into the main one with
 * relative imports and must not import its own package by name. Declaring only
 * the fields these tools read keeps the boundary intact and makes the surface
 * they depend on explicit; the real types remain structurally assignable.
 */
export interface ToolRepository {
  name?: string;
  description?: string;
  language?: string;
  fork?: boolean;
  forks_count?: number;
  stargazers_count?: number;
  star_count?: number;
  html_url?: string;
  web_url?: string;
  pushed_at?: string;
  last_activity_at?: string;
}

export type ToolRepositoryGroups = {
  [key: string]: ToolRepository[] | undefined;
};

export type ToolRepositories = {
  [provider: string]: ToolRepositoryGroups | undefined;
};

export interface ToolProviderConfig {
  github?: string;
  gitlab?: string;
}

/**
 * These tools proxy the GitHub and GitLab APIs, so repeated agent calls would
 * otherwise burn the visitor's rate limit. They read through
 * GitProviderService, which already caches responses for ten minutes, and the
 * number of returned repositories is capped.
 */
export interface GitPortfolioToolSource {
  getRepositories(config?: ToolProviderConfig): Observable<ToolRepositories>;
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

interface RepositorySummary {
  name: string;
  provider: string;
  kind: 'own' | 'forked';
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string | null;
  updatedAt: string | null;
}

function repositoryUrl(repository: ToolRepository): string | null {
  return repository.html_url ?? repository.web_url ?? null;
}

function repositoryStars(repository: ToolRepository): number {
  return repository.stargazers_count ?? repository.star_count ?? 0;
}

function summarize(
  repository: ToolRepository,
  provider: string,
  kind: 'own' | 'forked'
): RepositorySummary {
  return {
    name: repository.name ?? 'unknown',
    provider,
    kind,
    description: repository.description ?? null,
    language: repository.language ?? null,
    stars: repositoryStars(repository),
    forks: repository.forks_count ?? 0,
    url: repositoryUrl(repository),
    updatedAt: repository.pushed_at ?? repository.last_activity_at ?? null
  };
}

function flatten(repositories: ToolRepositories): RepositorySummary[] {
  const result: RepositorySummary[] = [];

  Object.entries(repositories).forEach(([provider, groups]) => {
    if (!groups) {
      return;
    }
    (groups['own'] ?? []).forEach((repository) =>
      result.push(summarize(repository, provider, 'own'))
    );
    (groups['forked'] ?? []).forEach((repository) =>
      result.push(summarize(repository, provider, 'forked'))
    );
  });

  return result;
}

/**
 * Creates the git portfolio tools for a concrete repository source.
 *
 * @param source usually the injected GitProviderService
 * @param config the provider user names the surrounding page renders
 */
export function createGitPortfolioTools(
  source: GitPortfolioToolSource,
  config?: ToolProviderConfig
): readonly ModelContextTool<never>[] {
  const load = () => firstValueFrom(source.getRepositories(config));

  const listTool: ModelContextTool<{
    limit?: number;
    language?: string;
    includeForks?: boolean;
  }> = {
    name: 'git_portfolio_list',
    title: 'List portfolio repositories',
    description:
      'Lists the public repositories shown in this portfolio, sorted by stars. Results are served from a cache and capped.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          minimum: 1,
          maximum: MAX_LIMIT,
          description: `Maximum number of repositories to return (default ${DEFAULT_LIMIT}).`
        },
        language: {
          type: 'string',
          description: 'Only return repositories with this primary language.'
        },
        includeForks: {
          type: 'boolean',
          description: 'Include forked repositories (default false).'
        }
      }
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async ({ limit, language, includeForks }) => {
      const cap = Math.min(
        Math.max(Math.floor(limit ?? DEFAULT_LIMIT), 1),
        MAX_LIMIT
      );

      let repositories = flatten(await load());

      if (!includeForks) {
        repositories = repositories.filter((repo) => repo.kind === 'own');
      }
      if (language) {
        const wanted = language.toLowerCase();
        repositories = repositories.filter(
          (repo) => repo.language?.toLowerCase() === wanted
        );
      }

      repositories.sort((a, b) => b.stars - a.stars);

      return {
        repositories: repositories.slice(0, cap),
        returned: Math.min(repositories.length, cap),
        total: repositories.length,
        truncated: repositories.length > cap
      };
    }
  };

  const languagesTool: ModelContextTool<Record<string, never>> = {
    name: 'git_portfolio_languages',
    title: 'Summarise portfolio languages',
    description:
      'Reports which programming languages appear in this portfolio and how many repositories use each, so an agent can answer questions without listing every repository.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async () => {
      const counts = new Map<string, number>();

      flatten(await load())
        .filter((repo) => repo.kind === 'own' && repo.language)
        .forEach((repo) => {
          const language = repo.language as string;
          counts.set(language, (counts.get(language) ?? 0) + 1);
        });

      return {
        languages: [...counts.entries()]
          .map(([language, repositories]) => ({ language, repositories }))
          .sort((a, b) => b.repositories - a.repositories)
      };
    }
  };

  return [
    listTool as unknown as ModelContextTool<never>,
    languagesTool as unknown as ModelContextTool<never>
  ];
}
