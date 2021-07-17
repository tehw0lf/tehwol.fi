import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GitProviderConfig } from './git-provider-config-type';
import { GitProviderService } from './git-provider.service';
import { GitProviders } from './git-providers-type';
import { GitRepositories } from './git-repositories-type';
import { GitRepository } from './git-repository-type';

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'ng-git-portfolio',
  templateUrl: './ng-git-portfolio.component.html',
  styleUrls: ['./ng-git-portfolio.component.scss']
})
export class NgGitPortfolioComponent implements OnInit, OnDestroy {
  @Input()
  gitProviderConfig: GitProviderConfig = { github: '', gitlab: '' };

  @Input()
  showForked = true;

  @Input()
  showOwn = true;

  gitProviders = GitProviders;
  currentRepo: GitRepository | undefined;
  gitRepositories$: Observable<GitRepositories> | undefined;
  private unsubscribe$ = new Subject<void>();

  constructor(private gitProviderService: GitProviderService) {}

  ngOnInit(): void {
    this.getRepositories();
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();this.unsubscribe$.complete()
  }

  copyToClipboard(githubRepo: GitRepository): void {
    this.currentRepo = githubRepo;
  }

  isCopiedToClipboard(githubRepo: GitRepository): boolean {
    if (!this.currentRepo) {
      return false;
    }
    return this.currentRepo.id === githubRepo.id ? true : false;
  }

  getRepositories(): void {
    this.gitRepositories$ = this.gitProviderService.fetchRepositories(
      this.gitProviderConfig
    ).pipe(takeUntil(this.unsubscribe$));
  }

  getOwnGitRepositories(
    gitRepositories: GitRepositories,
    gitProvider: string
  ): GitRepository[] {
    if (gitRepositories) {
      switch (gitProvider) {
        case 'github':
          if (gitRepositories.github) {
            return gitRepositories.github.own;
          } else {
            return [];
          }

        case 'gitlab':
          if (gitRepositories.gitlab) {
            return gitRepositories.gitlab.own;
          } else {
            return [];
          }

        default:
          return [];
      }
    } else {
      return [];
    }
  }

  getForkedGitRepositories(
    gitRepositories: GitRepositories,
    gitProvider: string
  ): GitRepository[] {
    if (gitRepositories) {
      switch (gitProvider) {
        case 'github':
          if (gitRepositories.github) {
            return gitRepositories.github.forked;
          } else {
            return [];
          }

        case 'gitlab':
          if (gitRepositories.gitlab) {
            return gitRepositories.gitlab.forked;
          } else {
            return [];
          }

        default:
          return [];
      }
    } else {
      return [];
    }
  }
}
