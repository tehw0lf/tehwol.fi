import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GitProviderService } from './git-provider.service';
import { GitProviderConfig } from './types/git-provider-config-type';
import { GitProviders } from './types/git-providers-type';
import { GitRepositories } from './types/git-repositories-type';
import { GitRepository } from './types/git-repository-type';
import { RepoCardComponent } from './repo-card/repo-card.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgStyle, AsyncPipe, KeyValuePipe } from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'git-portfolio',
  templateUrl: './git-portfolio.component.html',
  styleUrls: ['./git-portfolio.component.scss'],
  standalone: true,
  imports: [
    NgStyle,
    MatProgressSpinnerModule,
    RepoCardComponent,
    AsyncPipe,
    KeyValuePipe
  ]
})
export class GitPortfolioComponent implements OnInit, OnDestroy {
  @Input() buttonStyle = { 'background-color': '#424242', color: '#cc7832' };

  @Input() cardStyle = {
    color: '#437da8',
    'background-color': 'rgba(34, 34, 34, 0.75)',
    'backdrop-filter': 'blur(50px)'
  };

  @Input()
  textStyle = { color: '#437da8' };

  @Input()
  checkColor = '#38e038';

  @Input()
  forkColor = '#437da8';

  @Input()
  issueColor = 'rgb(56, 224, 56)';

  @Input()
  pasteColor = '#cc7832';

  @Input()
  starColor = 'gold';

  @Input()
  gitProviderConfig: GitProviderConfig = {
    github: 'tehw0lf',
    gitlab: 'tehw0lf'
  };

  @Input()
  showForked = true;

  @Input()
  showOwn = true;

  loading: Observable<boolean>;
  gitProviders = GitProviders;
  currentRepo: GitRepository | undefined;
  gitRepositories$: Observable<GitRepositories> | undefined;
  private unsubscribe$ = new Subject<void>();

  constructor(private gitProviderService: GitProviderService) {
    this.loading = this.gitProviderService.loading;
  }

  ngOnInit(): void {
    this.getRepositories();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    this.gitRepositories$ = this.gitProviderService
      .getRepositories(this.gitProviderConfig)
      .pipe(takeUntil(this.unsubscribe$));
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

  hasRepositories(
    gitRepositories: GitRepositories,
    gitProvider: string,
    type: 'own' | 'forked'
  ): boolean {
    if (gitRepositories) {
      switch (gitProvider) {
        case 'github':
          if (gitRepositories.github) {
            return gitRepositories.github[type].length > 0;
          }
          break;

        case 'gitlab':
          if (gitRepositories.gitlab) {
            return gitRepositories.gitlab[type].length > 0;
          }
          break;
      }
    }
    return false;
  }
}
