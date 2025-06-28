import {
  BreakpointObserver,
  BreakpointState,
  LayoutModule
} from '@angular/cdk/layout';
import {
  AsyncPipe,
  CommonModule,
  KeyValuePipe,
  NgStyle
} from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnDestroy, OnInit, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { GitProviderService } from './git-provider.service';
import { RepoCardComponent } from './repo-card/repo-card.component';
import { GitProviderConfig } from './types/git-provider-config-type';
import { GitProviders } from './types/git-providers-type';
import { GitRepositories } from './types/git-repositories-type';
import { GitRepository } from './types/git-repository-type';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'git-portfolio',
  templateUrl: './git-portfolio.component.html',
  styleUrls: ['./git-portfolio.component.scss'],
  imports: [
    CommonModule,
    LayoutModule,
    NgStyle,
    MatProgressSpinnerModule,
    RepoCardComponent,
    AsyncPipe,
    KeyValuePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GitPortfolioComponent implements OnInit, OnDestroy {
  private gitProviderService = inject(GitProviderService);
  private breakpointObserver = inject(BreakpointObserver);

  buttonStyle = input({ 'background-color': '#424242', color: '#cc7832' });

  cardStyle = input({
    color: '#437da8',
    'background-color': 'rgba(34, 34, 34, 0.75)',
    'backdrop-filter': 'blur(50px)'
  });

  textStyle = input({ color: '#437da8' });

  checkColor = input('#38e038');

  forkColor = input('#437da8');

  issueColor = input('rgb(56, 224, 56)');

  pasteColor = input('#cc7832');

  starColor = input('gold');

  gitProviderConfig = input<GitProviderConfig>({});

  showForked = input(true);

  showOwn = input(true);

  loading: Observable<boolean>;
  gitProviders = GitProviders;
  currentRepo: GitRepository | undefined;
  gitRepositories$: Observable<GitRepositories> | undefined;
  viewport = '';

  private unsubscribe$ = new Subject<void>();

  constructor() {
    this.loading = this.gitProviderService.loading;

    this.breakpointObserver
      .observe([
        '(max-width: 599.98px)',
        '(max-width: 959.98px)',
        '(min-width: 960px)'
      ])
      .pipe(
        tap((breakpointState: BreakpointState) => {
          if (breakpointState.breakpoints['(max-width: 599.98px)']) {
            this.viewport = 'xsmall';
          } else if (breakpointState.breakpoints['(max-width: 959.98px)']) {
            this.viewport = 'small';
          } else {
            this.viewport = 'medium';
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.getRepositories();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  copyToClipboard(gitRepo: GitRepository): void {
    this.currentRepo = gitRepo;
  }

  isCopiedToClipboard(gitRepo: GitRepository): boolean {
    if (!this.currentRepo) {
      return false;
    }
    return this.currentRepo.id === gitRepo.id ? true : false;
  }

  getRepositories(): void {
    this.gitRepositories$ = this.gitProviderService
      .getRepositories(this.gitProviderConfig())
      .pipe(takeUntil(this.unsubscribe$));
  }

  getGitRepositoriesOfType(
    gitRepositories: GitRepositories,
    gitProvider: string,
    type: 'own' | 'forked'
  ): GitRepository[] {
    return gitRepositories[gitProvider]?.[type] ?? [];
  }

  hasAnyRepositories(
    gitRepositories: GitRepositories,
    gitProvider: string
  ): boolean {
    return (
      (gitRepositories[gitProvider] &&
        gitRepositories[gitProvider].own?.length > 0 &&
        gitRepositories[gitProvider].forked?.length > 0) ??
      false
    );
  }

  hasRepositoriesOfType(
    gitRepositories: GitRepositories,
    gitProvider: string,
    type: 'own' | 'forked'
  ): boolean {
    return (
      (gitRepositories[gitProvider] &&
        gitRepositories[gitProvider]?.[type]?.length > 0) ??
      false
    );
  }
}
