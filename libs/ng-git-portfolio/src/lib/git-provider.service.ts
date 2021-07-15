import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { GitProviderConfig } from './git-provider-config-type';
import { GitRepositories } from './git-repositories-type';
import { GitRepository } from './git-repository-type';

@Injectable({
  providedIn: 'root'
})
export class GitProviderService {
  constructor(private http: HttpClient) {}

  fetchRepositories(
    gitProviderUserNames: GitProviderConfig
  ): Observable<GitRepositories> {
    return zip(
      this.fetchGithubRepositories(gitProviderUserNames.github ?? ''),
      this.fetchGitlabRepositories(gitProviderUserNames.gitlab ?? '')
    ).pipe(
      map((gitRepositoryArray: [GitRepository[], GitRepository[]]) => ({
        github: this.filterAndSortGitRepositories(gitRepositoryArray[0]),
        gitlab: this.filterAndSortGitRepositories(gitRepositoryArray[1])
      }))
    );
  }

  private filterAndSortGitRepositories(
    gitRepositoryArray: GitRepository[]
  ): { own: GitRepository[]; forked: GitRepository[] } {
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
    return of([new GitRepository()]);
  }
  private fetchGitlabRepositories(
    gitlabUser: string
  ): Observable<GitRepository[]> {
    if (gitlabUser !== '') {
      return this.http.get<GitRepository[]>(
        `https://gitlab.com/api/v4/users/${gitlabUser}/projects`
      );
    }
    return of([new GitRepository()]);
  }
}
