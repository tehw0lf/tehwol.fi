import {
  BreakpointObserver,
  BreakpointState,
  LayoutModule
} from '@angular/cdk/layout';
import {
  CommonModule,
  KeyValuePipe,
  NgStyle
} from '@angular/common';
import { ChangeDetectionStrategy, Component, input, inject, signal, effect, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
    KeyValuePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GitPortfolioComponent implements OnDestroy {
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

  loading = toSignal(this.gitProviderService.loading, { initialValue: true });
  gitProviders = GitProviders;
  currentRepo = signal<GitRepository | undefined>(undefined);
  gitRepositories = signal<GitRepositories | undefined>(undefined);
  viewport = signal('');

  private unsubscribe$ = new Subject<void>();

  constructor() {
    effect(() => {
      this.getRepositories();
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
    this.gitProviderService
      .getRepositories(this.gitProviderConfig())
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(repositories => {
        this.gitRepositories.set(repositories);
      });
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
