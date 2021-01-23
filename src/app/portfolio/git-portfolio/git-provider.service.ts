import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { GitProviders, GitRepositories } from './git-repositories-type';
import { GitRepository } from './git-repository-type';

@Injectable({
  providedIn: 'root'
})
export class GitProviderService {
  constructor(private http: HttpClient) {}

  fetchRepositories(
    gitProviderUserNames: Map<GitProviders, string>
  ): Observable<GitRepositories> {
    return zip(
      this.fetchGithubRepositories(
        gitProviderUserNames.get(GitProviders.github)
      ),
      this.fetchGitlabRepositories(
        gitProviderUserNames.get(GitProviders.gitlab)
      )
    ).pipe(
      map((gitRepositoryArray: [GitRepository[], GitRepository[]]) => {
        return {
          github: this.filterAndSortGitRepositories(gitRepositoryArray[0]),
          gitlab: this.filterAndSortGitRepositories(gitRepositoryArray[1])
        };
      })
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
            repoA.stargazers_count - repoB.stargazers_count
        ),
      forked: gitRepositoryArray
        .filter((gitRepository: GitRepository) => gitRepository.fork)
        .sort(
          (repoA: GitRepository, repoB: GitRepository) =>
            repoA.stargazers_count - repoB.stargazers_count
        )
    };
  }

  private fetchGithubRepositories(
    githubUser: string
  ): Observable<GitRepository[]> {
    return this.http.get<GitRepository[]>(
      `https://api.github.com/users/${githubUser}/repos`
    );
  }
  private fetchGitlabRepositories(
    gitlabUser: string
  ): Observable<GitRepository[]> {
    return this.http.get<GitRepository[]>(
      `https://gitlab.com/api/v4/users/${gitlabUser}/projects`
    );
  }
}
