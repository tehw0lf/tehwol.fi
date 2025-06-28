import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';

import { GitProviderConfig } from './types/git-provider-config-type';
import { GitRepositories } from './types/git-repositories-type';
import { GitRepository } from './types/git-repository-type';

@Injectable({
  providedIn: 'root'
})
export class GitProviderService {
  private http = inject(HttpClient);

  private loadingStateSubject = new BehaviorSubject<boolean>(true);
  private repositorySubject = new BehaviorSubject<GitRepositories>({});
  private repositoryCache = new Map<string, Observable<GitRepositories>>();

  get loading(): Observable<boolean> {
    return this.loadingStateSubject.asObservable();
  }

  getRepositories(
    gitProviderUserNames?: GitProviderConfig
  ): Observable<GitRepositories> {
    const cacheKey = JSON.stringify(gitProviderUserNames);
    
    if (!this.repositoryCache.has(cacheKey)) {
      const repositories$ = this.fetchRepositories(gitProviderUserNames).pipe(
        tap((repositories: GitRepositories) => {
          this.repositorySubject.next(repositories);
          this.loadingStateSubject.next(false);
        }),
        shareReplay(1)
      );
      
      this.repositoryCache.set(cacheKey, repositories$);
    }
    
    return this.repositoryCache.get(cacheKey) || this.repositorySubject.asObservable();
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
