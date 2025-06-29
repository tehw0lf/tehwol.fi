import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';

import { GitProviderConfig } from './types/git-provider-config-type';
import { GitRepositories } from './types/git-repositories-type';
import { GitRepository } from './types/git-repository-type';

interface CacheEntry {
  data: Observable<GitRepositories>;
  timestamp: number;
  ttl: number;
}

@Injectable({
  providedIn: 'root'
})
export class GitProviderService {
  private http = inject(HttpClient);
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CACHE_SIZE = 50;

  private loadingStateSubject = new BehaviorSubject<boolean>(true);
  private repositorySubject = new BehaviorSubject<GitRepositories>({});
  private repositoryCache = new Map<string, CacheEntry>();

  get loading(): Observable<boolean> {
    return this.loadingStateSubject.asObservable();
  }

  getRepositories(
    gitProviderUserNames?: GitProviderConfig
  ): Observable<GitRepositories> {
    const cacheKey = this.createCacheKey(gitProviderUserNames);
    const cachedEntry = this.repositoryCache.get(cacheKey);
    
    // Check if cache entry exists and is still valid
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return cachedEntry.data;
    }
    
    // Clean up expired entries and manage cache size
    this.cleanupCache();
    
    const repositories$ = this.fetchRepositories(gitProviderUserNames).pipe(
      tap((repositories: GitRepositories) => {
        this.repositorySubject.next(repositories);
        this.loadingStateSubject.next(false);
      }),
      shareReplay(1)
    );
    
    this.repositoryCache.set(cacheKey, {
      data: repositories$,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });
    
    return repositories$;
  }

  private createCacheKey(config?: GitProviderConfig): string {
    if (!config) return 'default';
    const parts: string[] = [];
    if (config.github) parts.push(`gh:${config.github}`);
    if (config.gitlab) parts.push(`gl:${config.gitlab}`);
    return parts.join('|') || 'default';
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return (Date.now() - entry.timestamp) < entry.ttl;
  }

  private cleanupCache(): void {
    // Remove expired entries
    for (const [key, entry] of this.repositoryCache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.repositoryCache.delete(key);
      }
    }
    
    // If cache is still too large, remove oldest entries
    if (this.repositoryCache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.repositoryCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE + 1);
      toRemove.forEach(([key]) => this.repositoryCache.delete(key));
    }
  }

  fetchRepositories(
    gitProviderUserNames?: GitProviderConfig
  ): Observable<GitRepositories> {
    return zip(
      this.fetchGithubRepositories(gitProviderUserNames?.github ?? ''),
      this.fetchGitlabRepositories(gitProviderUserNames?.gitlab ?? '')
    ).pipe(
      map((gitRepositoryMap: GitRepository[][]) => {
        const repositories: GitRepositories = {
          github: this.filterAndSortGitRepositories(gitRepositoryMap[0]),
          gitlab: this.filterAndSortGitRepositories(gitRepositoryMap[1])
        };
        return repositories;
      })
    );
  }

  private filterAndSortGitRepositories(gitRepositoryArray: GitRepository[]): {
    own: GitRepository[];
    forked: GitRepository[];
  } {
    return {
      own: gitRepositoryArray
        .filter((gitRepository: GitRepository) => !gitRepository.fork)
        .sort(
          (repoA: GitRepository, repoB: GitRepository) =>
            (repoB.stargazers_count ?? 0) - (repoA.stargazers_count ?? 0)
        ),
      forked: gitRepositoryArray
        .filter((gitRepository: GitRepository) => gitRepository.fork)
        .sort(
          (repoA: GitRepository, repoB: GitRepository) =>
            (repoB.stargazers_count ?? 0) - (repoA.stargazers_count ?? 0)
        )
    };
  }

  private fetchGithubRepositories(
    githubUser: string
  ): Observable<GitRepository[]> {
    if (githubUser !== '') {
      return this.http.get<GitRepository[]>(
        `https://api.github.com/users/${githubUser}/repos`
      ).pipe(shareReplay(1));
    }
    return of([]);
  }

  private fetchGitlabRepositories(
    gitlabUser: string
  ): Observable<GitRepository[]> {
    if (gitlabUser !== '') {
      return this.http.get<GitRepository[]>(
        `https://gitlab.com/api/v4/users/${gitlabUser}/projects`
      ).pipe(shareReplay(1));
    }
    return of([]);
  }

  clearCache(): void {
    this.repositoryCache.clear();
    this.loadingStateSubject.next(true);
    this.repositorySubject.next({});
  }
}
