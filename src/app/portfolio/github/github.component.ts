import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { GithubRepository } from './github-repository-type';
import { GithubService } from './github.service';

@Component({
  selector: 'app-github',
  templateUrl: './github.component.html',
  styleUrls: ['./github.component.scss']
})
export class GithubComponent implements OnInit, OnDestroy {
  @Input()
  githubUser: string;

  @Input()
  showForked = true;

  @Input()
  showOwn = true;

  private unsubscribe$ = new Subject<void>();
  currentRepo: GithubRepository;
  allGithubRepositories: GithubRepository[];
  ownGithubRepositories: GithubRepository[] = [];
  forkedGithubRepositories: GithubRepository[] = [];

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.fetchAndSortRepositories();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  copyToClipboard(githubRepo: GithubRepository): void {
    this.currentRepo = githubRepo;
  }

  isCopiedToClipboard(githubRepo: GithubRepository): boolean {
    if (!this.currentRepo) {
      return false;
    }
    return this.currentRepo.id === githubRepo.id ? true : false;
  }

  fetchAndSortRepositories(): void {
    this.githubService
      .fetchRepositories()
      .pipe(
        tap((githubRepos: GithubRepository[]) => {
          this.allGithubRepositories = githubRepos.sort(
            (repo1, repo2) => repo2.stargazers_count - repo1.stargazers_count
          );
          this.filterRepositories();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  filterRepositories(): void {
    this.filterForkedRepositories();
    this.filterOwnRepositories();
  }

  filterForkedRepositories(): void {
    this.allGithubRepositories.filter((githubRepo) => {
      if (githubRepo.fork) {
        this.forkedGithubRepositories.push(githubRepo);
      }
    });
  }
  filterOwnRepositories(): void {
    this.allGithubRepositories.filter((githubRepo) => {
      if (githubRepo.owner.login === this.githubUser && !githubRepo.fork) {
        this.ownGithubRepositories.push(githubRepo);
      }
    });
  }
}
