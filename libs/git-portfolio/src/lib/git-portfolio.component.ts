import {
  BreakpointObserver,
  BreakpointState,
  LayoutModule
} from '@angular/cdk/layout';
import { CommonModule, KeyValuePipe, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, inject, signal, effect, computed, untracked, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

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
    MatTabsModule,
    RepoCardComponent,
    KeyValuePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GitPortfolioComponent implements OnDestroy {
  private gitProviderService = inject(GitProviderService);
  private breakpointObserver = inject(BreakpointObserver);

  buttonStyle = input({
    'background-color': 'var(--tw-neutral-650, #424242)',
    color: 'var(--tw-accent, #cc7832)'
  });

  cardStyle = input({
    color: 'var(--tw-text, #6699bb)',
    'background-color': 'var(--tw-glass-bg, rgba(34, 34, 34, 0.75))',
    'backdrop-filter': 'var(--tw-glass-blur, blur(50px))'
  });

  textStyle = input({ color: 'var(--tw-text, #6699bb)' });

  checkColor = input('var(--tw-success, #38e038)');

  forkColor = input('var(--tw-text, #6699bb)');

  issueColor = input('var(--tw-success, #38e038)');

  pasteColor = input('var(--tw-accent, #cc7832)');

  starColor = input('gold');

  gitProviderConfig = input<GitProviderConfig>({});

  showForked = input(true);

  showOwn = input(true);

  labels = input({
    ownRepos: 'Own Repos',
    forkedRepos: 'Forked Repos',
    noOwnRepos: 'This user has not created any repositories yet',
    noForkedRepos: 'This user has not forked any repositories yet',
    copyRepoUrl: 'Copy repo URL',
    created: 'Created: ',
    updated: 'Updated: ',
    loadError: 'Repositories could not be loaded',
    retry: 'Try again',
    retrying: 'Retrying...'
  });

  repoCardLabels = computed(() => ({
    copyRepoUrl: this.labels().copyRepoUrl,
    created: this.labels().created,
    updated: this.labels().updated
  }));

  loading = toSignal(this.gitProviderService.loading, { initialValue: true });
  gitProviders = GitProviders;
  currentRepo = signal<GitRepository | undefined>(undefined);
  gitRepositories = signal<GitRepositories | undefined>(undefined);
  viewport = signal('');
  loadFailed = signal(false);
  retrying = signal(false);
  coolingDown = signal(false);
  retryDisabled = computed(() => this.retrying() || this.coolingDown());

  private readonly RETRY_COOLDOWN_MS = 3000;
  private lastRetryAt = 0;
  private cooldownTimer?: ReturnType<typeof setTimeout>;

  private unsubscribe$ = new Subject<void>();

  /**
   * Every load goes through here, so switchMap can drop the previous one. The
   * config is a reactive input: a change starts a new request while an earlier
   * one may still be in flight, and the provider APIs are slow enough for that
   * to happen in practice. Without the cancel, a stale response arriving second
   * would overwrite the current user's repositories, or fail a request the user
   * has already moved on from and show the error state over good data.
   */
  private load$ = new Subject<GitProviderConfig>();

  constructor() {
    this.load$
      .pipe(
        switchMap(config =>
          this.gitProviderService.getRepositories(config).pipe(
            // Keeps a failed request from completing the outer subscription,
            // which would leave later retries with nothing listening.
            catchError(() => of(null))
          )
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(repositories => {
        this.gitRepositories.set(repositories ?? undefined);
        this.loadFailed.set(repositories === null);
        this.retrying.set(false);
      });

    effect(() => {
      // Reads the config so a changed user refetches; the retry signals are set
      // inside getRepositories() and must not retrigger this effect.
      this.gitProviderConfig();
      untracked(() => this.getRepositories());
    });

    this.breakpointObserver
      .observe([
        '(max-width: 599.98px)',
        '(max-width: 959.98px)',
        '(min-width: 960px)'
      ])
      .pipe(
        tap((breakpointState: BreakpointState) => {
          if (breakpointState.breakpoints['(max-width: 599.98px)']) {
            this.viewport.set('xsmall');
          } else if (breakpointState.breakpoints['(max-width: 959.98px)']) {
            this.viewport.set('small');
          } else {
            this.viewport.set('medium');
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    clearTimeout(this.cooldownTimer);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  copyToClipboard(gitRepo: GitRepository): void {
    this.currentRepo.set(gitRepo);
  }

  isCopiedToClipboard(gitRepo: GitRepository): boolean {
    if (!this.currentRepo()) {
      return false;
    }
    return this.currentRepo()?.id === gitRepo.id ? true : false;
  }

  getRepositories(): void {
    this.load$.next(this.gitProviderConfig());
  }

  /**
   * Rate limits the retry button. `retrying` alone is not enough: a failing
   * request (offline, aborted) rejects almost immediately, so the in-flight flag
   * is already back to false by the time the next click lands and a user could
   * hammer the provider APIs, which are rate limited per IP. The cooldown makes
   * the gap between two attempts the binding constraint.
   */
  retryLoad(): void {
    const now = Date.now();
    if (this.retrying() || now - this.lastRetryAt < this.RETRY_COOLDOWN_MS) {
      return;
    }
    this.lastRetryAt = now;
    this.retrying.set(true);
    this.loadFailed.set(false);
    this.startCooldown();
    this.getRepositories();
  }

  private startCooldown(): void {
    this.coolingDown.set(true);
    clearTimeout(this.cooldownTimer);
    this.cooldownTimer = setTimeout(
      () => this.coolingDown.set(false),
      this.RETRY_COOLDOWN_MS
    );
  }

  getGitRepositoriesOfType(
    gitRepositories: GitRepositories | undefined,
    gitProvider: string,
    type: 'own' | 'forked'
  ): GitRepository[] {
    return gitRepositories?.[gitProvider]?.[type] ?? [];
  }

  hasAnyRepositories(
    gitRepositories: GitRepositories | undefined,
    gitProvider: string
  ): boolean {
    return (
      (gitRepositories?.[gitProvider] &&
        (gitRepositories[gitProvider].own?.length > 0 ||
         gitRepositories[gitProvider].forked?.length > 0)) ??
      false
    );
  }

  /**
   * Appends the repository count to a tab label, so both the existence and the
   * size of each group are visible without opening the tab.
   */
  tabLabel(
    label: string,
    gitRepositories: GitRepositories | undefined,
    gitProvider: string,
    type: 'own' | 'forked'
  ): string {
    const count = this.getGitRepositoriesOfType(
      gitRepositories,
      gitProvider,
      type
    ).length;
    return `${label} (${count})`;
  }

  hasRepositoriesOfType(
    gitRepositories: GitRepositories | undefined,
    gitProvider: string,
    type: 'own' | 'forked'
  ): boolean {
    return (
      (gitRepositories?.[gitProvider] &&
        gitRepositories[gitProvider]?.[type]?.length > 0) ??
      false
    );
  }
}
