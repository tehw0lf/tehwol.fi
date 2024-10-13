import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { GitProviderConfig } from './types/git-provider-config-type';
import { GitRepositories } from './types/git-repositories-type';
import { GitRepository } from './types/git-repository-type';

@Injectable({
  providedIn: 'root'
})
export class GitProviderService {
  private loadingStateSubject = new BehaviorSubject<boolean>(true);
  private repositorySubject = new BehaviorSubject<GitRepositories>({});

  constructor(private http: HttpClient) {}

  get loading(): Observable<boolean> {
    return this.loadingStateSubject.asObservable();
  }

  getRepositories(
    gitProviderUserNames?: GitProviderConfig
  ): Observable<GitRepositories> {
    if (
      this.repositorySubject.value.github === undefined &&
      this.repositorySubject.value.gitlab === undefined
    ) {
      this.fetchRepositories(gitProviderUserNames)
        .pipe(
          tap((repositories: GitRepositories) => {
            this.repositorySubject.next(repositories);
            this.loadingStateSubject.next(false);
          })
        )
        .subscribe();
    }
    return this.repositorySubject.asObservable();
  }

  fetchRepositories(
    gitProviderUserNames?: GitProviderConfig
  ): Observable<GitRepositories> {
    return zip(
      this.fetchGithubRepositories(gitProviderUserNames?.github ?? ''),
      this.fetchGitlabRepositories(gitProviderUserNames?.gitlab ?? '')
    ).pipe(
      map((gitRepositoryArray: [GitRepository[], GitRepository[]]) => {
        const repositories: GitRepositories = {
          github: this.filterAndSortGitRepositories(gitRepositoryArray[0]),
          gitlab: this.filterAndSortGitRepositories(gitRepositoryArray[1])
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
      );
    }
    return of([]);
  }
  private fetchGitlabRepositories(
    gitlabUser: string
  ): Observable<GitRepository[]> {
    if (gitlabUser !== '') {
      return this.http.get<GitRepository[]>(
        `https://gitlab.com/api/v4/users/${gitlabUser}/projects`
      );
    }
    return of([]);
  }
}
