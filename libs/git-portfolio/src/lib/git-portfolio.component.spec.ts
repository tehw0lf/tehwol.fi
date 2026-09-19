import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabGroup } from '@angular/material/tabs';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, NEVER, Subject, of, throwError } from 'rxjs';

import { GitPortfolioComponent } from './git-portfolio.component';
import { GitProviderService } from './git-provider.service';
import { RepoCardComponent } from './repo-card/repo-card.component';
import { GitRepositories } from './types/git-repositories-type';
import { GitRepository } from './types/git-repository-type';

const createGitRepository = (
  id: number,
  name: string,
  fork = false,
  stargazers_count = 0
): GitRepository => {
  const repo = new GitRepository();
  repo.id = id;
  repo.name = name;
  repo.fork = fork;
  repo.stargazers_count = stargazers_count;
  return repo;
};

const MOCK_REPOSITORIES: GitRepositories = {
  github: {
    own: [
      createGitRepository(1, 'repo1', false, 10),
      createGitRepository(3, 'repo3', false, 15)
    ],
    forked: [
      createGitRepository(2, 'repo2', true, 5)
    ]
  },
  gitlab: {
    own: [
      createGitRepository(4, 'project1', false, 8)
    ],
    forked: [
      createGitRepository(5, 'project2', true, 3)
    ]
  }
};

describe('GitPortfolioComponent', () => {
  let component: GitPortfolioComponent;
  let fixture: ComponentFixture<GitPortfolioComponent>;
  let gitProviderService: jest.Mocked<Pick<GitProviderService, 'getRepositories'>> & { loading: Observable<boolean> };
  let breakpointObserver: jest.Mocked<Pick<BreakpointObserver, 'observe'>>;
  let breakpointSubject: BehaviorSubject<BreakpointState>;

  // Helper functions to safely access mock data
  const getGithubOwnRepo = (index: number) => MOCK_REPOSITORIES.github?.own?.[index] as GitRepository;
  const getGithubOwnRepos = () => MOCK_REPOSITORIES.github?.own || [];
  const getGithubForkedRepos = () => MOCK_REPOSITORIES.github?.forked || [];

  beforeEach(async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('<svg></svg>') } as Response)
    ) as typeof fetch;

    const gitProviderSpy = {
      getRepositories: jest.fn(),
      loading: of(false)
    };
    
    breakpointSubject = new BehaviorSubject<BreakpointState>({
      matches: false,
      breakpoints: {
        '(max-width: 599.98px)': false,
        '(max-width: 959.98px)': false,
        '(min-width: 960px)': true
      }
    });

    const breakpointSpy = {
      observe: jest.fn().mockReturnValue(breakpointSubject.asObservable())
    };

    await TestBed.configureTestingModule({
      imports: [
        MatProgressSpinnerModule,
        MatCardModule,
        ClipboardModule,
        GitPortfolioComponent,
        RepoCardComponent
      ],
      providers: [
        { provide: GitProviderService, useValue: gitProviderSpy },
        { provide: BreakpointObserver, useValue: breakpointSpy }
      ]
    }).compileComponents();

    gitProviderService = TestBed.inject(GitProviderService) as jest.Mocked<Pick<GitProviderService, 'getRepositories'>> & { loading: Observable<boolean> };
    breakpointObserver = TestBed.inject(BreakpointObserver) as jest.Mocked<Pick<BreakpointObserver, 'observe'>>;
    // Mark as used to avoid lint warnings - used in responsive tests
    void breakpointObserver;
  });

  beforeEach(() => {
    gitProviderService.getRepositories.mockReturnValue(of(MOCK_REPOSITORIES));
    
    fixture = TestBed.createComponent(GitPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('clipboard functionality', () => {
    it('should copy to clipboard and track current repo', () => {
      const testRepo = getGithubOwnRepo(0);
      
      component.copyToClipboard(testRepo);
      
      expect(component.currentRepo()).toBe(testRepo);
      expect(component.isCopiedToClipboard(testRepo)).toBeTruthy();
    });

    it('should return false for copied status when no current repo', () => {
      const testRepo = getGithubOwnRepo(0);
      component.currentRepo.set(undefined);
      
      expect(component.isCopiedToClipboard(testRepo)).toBeFalsy();
    });

    it('should return false for copied status when different repo', () => {
      const repo1 = getGithubOwnRepo(0);
      const repo2 = getGithubOwnRepo(1);
      
      component.copyToClipboard(repo1);
      
      expect(component.isCopiedToClipboard(repo2)).toBeFalsy();
    });
  });

  describe('repository data methods', () => {
    it('should get repositories of specific type', () => {
      const ownRepos = component.getGitRepositoriesOfType(MOCK_REPOSITORIES, 'github', 'own');
      const forkedRepos = component.getGitRepositoriesOfType(MOCK_REPOSITORIES, 'github', 'forked');
      
      expect(ownRepos).toEqual(getGithubOwnRepos());
      expect(forkedRepos).toEqual(getGithubForkedRepos());
    });

    it('should return empty array for non-existent provider', () => {
      const repos = component.getGitRepositoriesOfType(MOCK_REPOSITORIES, 'bitbucket', 'own');
      
      expect(repos).toEqual([]);
    });

    it('should return empty array for non-existent type', () => {
      const emptyRepositories: GitRepositories = {
        github: { own: [], forked: [] }
      };
      
      const repos = component.getGitRepositoriesOfType(emptyRepositories, 'github', 'own');
      
      expect(repos).toEqual([]);
    });

    it('should check if provider has any repositories', () => {
      expect(component.hasAnyRepositories(MOCK_REPOSITORIES, 'github')).toBe(true);
      expect(component.hasAnyRepositories(MOCK_REPOSITORIES, 'gitlab')).toBe(true);
      expect(component.hasAnyRepositories(MOCK_REPOSITORIES, 'bitbucket')).toBe(false);
    });

    it('should check if provider has repositories of specific type', () => {
      expect(component.hasRepositoriesOfType(MOCK_REPOSITORIES, 'github', 'own')).toBe(true);
      expect(component.hasRepositoriesOfType(MOCK_REPOSITORIES, 'github', 'forked')).toBe(true);
      expect(component.hasRepositoriesOfType(MOCK_REPOSITORIES, 'gitlab', 'own')).toBe(true);
      expect(component.hasRepositoriesOfType(MOCK_REPOSITORIES, 'gitlab', 'forked')).toBe(true);
    });

    it('should return false for empty repository arrays', () => {
      const emptyRepositories: GitRepositories = {
        github: { own: [], forked: [] }
      };
      
      expect(component.hasAnyRepositories(emptyRepositories, 'github')).toBe(false);
      expect(component.hasRepositoriesOfType(emptyRepositories, 'github', 'own')).toBe(false);
    });

    it('should handle undefined repository data', () => {
      const emptyRepositories: GitRepositories = {};
      
      expect(component.hasAnyRepositories(emptyRepositories, 'github')).toBe(false);
      expect(component.hasRepositoriesOfType(emptyRepositories, 'github', 'own')).toBe(false);
      expect(component.getGitRepositoriesOfType(emptyRepositories, 'github', 'own')).toEqual([]);
    });
  });

  describe('responsive breakpoints', () => {
    it('should set viewport to xsmall for mobile breakpoint', () => {
      breakpointSubject.next({
        matches: true,
        breakpoints: {
          '(max-width: 599.98px)': true,
          '(max-width: 959.98px)': false,
          '(min-width: 960px)': false
        }
      });

      expect(component.viewport()).toBe('xsmall');
    });

    it('should set viewport to small for tablet breakpoint', () => {
      breakpointSubject.next({
        matches: true,
        breakpoints: {
          '(max-width: 599.98px)': false,
          '(max-width: 959.98px)': true,
          '(min-width: 960px)': false
        }
      });

      expect(component.viewport()).toBe('small');
    });

    it('should set viewport to medium for desktop breakpoint', () => {
      breakpointSubject.next({
        matches: true,
        breakpoints: {
          '(max-width: 599.98px)': false,
          '(max-width: 959.98px)': false,
          '(min-width: 960px)': true
        }
      });

      expect(component.viewport()).toBe('medium');
    });
  });

  describe('component lifecycle', () => {
    it('should call getRepositories automatically via effect', () => {
      // The effect in the constructor calls getRepositories, so we verify the service was called
      expect(gitProviderService.getRepositories).toHaveBeenCalled();
    });

    it('should setup repositories signal', () => {
      component.getRepositories();
      
      expect(component.gitRepositories).toBeDefined();
      expect(gitProviderService.getRepositories).toHaveBeenCalledWith(component.gitProviderConfig());
    });

    it('should unsubscribe on destroy', () => {
      jest.spyOn(component['unsubscribe$'], 'next');
      jest.spyOn(component['unsubscribe$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['unsubscribe$'].next).toHaveBeenCalled();
      expect(component['unsubscribe$'].complete).toHaveBeenCalled();
    });
  });

  describe('input properties', () => {
    it('should have default input values', () => {
      expect(component.buttonStyle()).toEqual({
        'background-color': 'var(--tw-neutral-650, #424242)',
        color: 'var(--tw-accent, #cc7832)'
      });
      expect(component.cardStyle()).toEqual({
        color: 'var(--tw-text, #6699bb)',
        'background-color': 'var(--tw-glass-bg, rgba(34, 34, 34, 0.75))',
        'backdrop-filter': 'var(--tw-glass-blur, blur(50px))'
      });
      expect(component.textStyle()).toEqual({
        color: 'var(--tw-text, #6699bb)'
      });
      expect(component.checkColor()).toBe('var(--tw-success, #38e038)');
      expect(component.forkColor()).toBe('var(--tw-text, #6699bb)');
      expect(component.issueColor()).toBe('var(--tw-success, #38e038)');
      expect(component.pasteColor()).toBe('var(--tw-accent, #cc7832)');
      expect(component.starColor()).toBe('gold');
      expect(component.gitProviderConfig()).toEqual({});
      expect(component.showForked()).toBe(true);
      expect(component.showOwn()).toBe(true);
    });

    it('should accept custom input values', () => {
      const customButtonStyle = { color: 'red' };
      const customConfig = { github: 'testuser' };
      
      fixture.componentRef.setInput('buttonStyle', customButtonStyle);
      fixture.componentRef.setInput('gitProviderConfig', customConfig);
      fixture.componentRef.setInput('showForked', false);
      fixture.detectChanges();
      
      expect(component.buttonStyle()).toEqual(customButtonStyle);
      expect(component.gitProviderConfig()).toEqual(customConfig);
      expect(component.showForked()).toBe(false);
    });
  });

  describe('loading state', () => {
    it('should expose loading signal from service', () => {
      expect(component.loading).toBeDefined();
      expect(typeof component.loading()).toBe('boolean');
    });
  });

  describe('tabbed sections', () => {
    const tabLabels = (): string[] =>
      Array.from(
        fixture.nativeElement.querySelectorAll('.mat-mdc-tab .mdc-tab__text-label')
      ).map((el) => (el as HTMLElement).textContent?.trim() ?? '');

    it('should offer own and forked repositories as tabs per provider', () => {
      // Two providers in the mock, each contributing an own and a forked tab.
      expect(tabLabels()).toEqual([
        'Own Repos (2)',
        'Forked Repos (1)',
        'Own Repos (1)',
        'Forked Repos (1)'
      ]);
    });

    it('should show the forked count in the label so forks are discoverable', () => {
      expect(tabLabels()).toContain('Forked Repos (1)');
    });

    it('should build one tab per visible section', () => {
      // The workspace runs without @angular/animations, so matTabContent bodies
      // stay lazy and tab switching cannot be driven here; the e2e suite covers
      // selecting a tab and seeing its cards.
      const group = fixture.debugElement.query(
        By.directive(MatTabGroup)
      ).componentInstance as MatTabGroup;

      expect(group._tabs.length).toBe(2);
    });

    it('should omit a section entirely when it is switched off', () => {
      fixture.componentRef.setInput('showForked', false);
      fixture.detectChanges();

      expect(tabLabels().some((label) => label.startsWith('Forked'))).toBe(
        false
      );
    });

    it('should count zero for an empty group', () => {
      expect(
        component.tabLabel('Forked Repos', { github: { own: [], forked: [] } }, 'github', 'forked')
      ).toBe('Forked Repos (0)');
    });
  });

  describe('load failure', () => {
    const failOnce = () =>
      gitProviderService.getRepositories.mockReturnValue(
        throwError(() => new Error('network error'))
      );

    it('should surface an error state instead of rendering nothing', () => {
      failOnce();
      const failed = TestBed.createComponent(GitPortfolioComponent);
      failed.detectChanges();

      expect(failed.componentInstance.loadFailed()).toBe(true);
      expect(
        failed.nativeElement.querySelector('.load-error')
      ).toBeTruthy();
    });

    it('should clear the error state once a retry succeeds', () => {
      failOnce();
      const failed = TestBed.createComponent(GitPortfolioComponent);
      failed.detectChanges();

      gitProviderService.getRepositories.mockReturnValue(of(MOCK_REPOSITORIES));
      failed.componentInstance.retryLoad();
      failed.detectChanges();

      expect(failed.componentInstance.loadFailed()).toBe(false);
      expect(failed.componentInstance.retrying()).toBe(false);
      expect(failed.nativeElement.querySelector('.load-error')).toBeNull();
    });

    it('should ignore retries while one is still in flight', () => {
      failOnce();
      const failed = TestBed.createComponent(GitPortfolioComponent);
      failed.detectChanges();

      // A request that never settles keeps `retrying` true, so the guard holds.
      gitProviderService.getRepositories.mockReturnValue(NEVER);
      const callsBefore = gitProviderService.getRepositories.mock.calls.length;

      failed.componentInstance.retryLoad();
      failed.componentInstance.retryLoad();
      failed.componentInstance.retryLoad();

      expect(
        gitProviderService.getRepositories.mock.calls.length - callsBefore
      ).toBe(1);
    });

    it('should rate limit retries that fail immediately', () => {
      // Offline requests reject synchronously, so `retrying` is already false
      // again on the next click: only the cooldown stops a click burst from
      // becoming a request burst.
      failOnce();
      const failed = TestBed.createComponent(GitPortfolioComponent);
      failed.detectChanges();
      const callsBefore = gitProviderService.getRepositories.mock.calls.length;

      for (let click = 0; click < 5; click++) {
        failed.componentInstance.retryLoad();
      }

      expect(
        gitProviderService.getRepositories.mock.calls.length - callsBefore
      ).toBe(1);
      expect(failed.componentInstance.retryDisabled()).toBe(true);
    });

    it('should allow another retry once the cooldown has elapsed', () => {
      jest.useFakeTimers();
      try {
        failOnce();
        const failed = TestBed.createComponent(GitPortfolioComponent);
        failed.detectChanges();
        const callsBefore =
          gitProviderService.getRepositories.mock.calls.length;

        failed.componentInstance.retryLoad();
        failed.componentInstance.retryLoad();
        jest.advanceTimersByTime(3000);
        failed.componentInstance.retryLoad();

        expect(
          gitProviderService.getRepositories.mock.calls.length - callsBefore
        ).toBe(2);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('stale responses', () => {
    /**
     * The config is a reactive input, so a change starts a new request while an
     * earlier one may still be in flight. These cover the ordering that made
     * that unsafe: the first request settling *after* the second.
     */
    const pending = () => new Subject<GitRepositories>();

    it('should ignore a slow response from a superseded config', () => {
      const first = pending();
      const second = pending();
      gitProviderService.getRepositories
        .mockReturnValueOnce(first)
        .mockReturnValueOnce(second);

      const staged = TestBed.createComponent(GitPortfolioComponent);
      staged.componentRef.setInput('gitProviderConfig', { github: 'olduser' });
      staged.detectChanges();

      staged.componentRef.setInput('gitProviderConfig', { github: 'newuser' });
      staged.detectChanges();

      // The current config answers first, then the abandoned one arrives late.
      second.next(MOCK_REPOSITORIES);
      const stale: GitRepositories = {
        github: { own: [createGitRepository(99, 'stale')], forked: [] }
      };
      first.next(stale);
      staged.detectChanges();

      expect(staged.componentInstance.gitRepositories()).toBe(MOCK_REPOSITORIES);
    });

    it('should not show the error state for a superseded request', () => {
      const first = pending();
      const second = pending();
      gitProviderService.getRepositories
        .mockReturnValueOnce(first)
        .mockReturnValueOnce(second);

      const staged = TestBed.createComponent(GitPortfolioComponent);
      staged.componentRef.setInput('gitProviderConfig', { github: 'olduser' });
      staged.detectChanges();

      staged.componentRef.setInput('gitProviderConfig', { github: 'newuser' });
      staged.detectChanges();

      second.next(MOCK_REPOSITORIES);
      // The abandoned request fails afterwards; the user has moved on from it.
      first.error(new Error('network error'));
      staged.detectChanges();

      expect(staged.componentInstance.loadFailed()).toBe(false);
      expect(staged.componentInstance.gitRepositories()).toBe(MOCK_REPOSITORIES);
    });

    it('should keep loading after a failure so a later retry still lands', () => {
      gitProviderService.getRepositories.mockReturnValue(
        throwError(() => new Error('network error'))
      );
      const failed = TestBed.createComponent(GitPortfolioComponent);
      failed.detectChanges();
      expect(failed.componentInstance.loadFailed()).toBe(true);

      gitProviderService.getRepositories.mockReturnValue(of(MOCK_REPOSITORIES));
      failed.componentRef.setInput('gitProviderConfig', { github: 'someone' });
      failed.detectChanges();

      expect(failed.componentInstance.loadFailed()).toBe(false);
      expect(failed.componentInstance.gitRepositories()).toBe(MOCK_REPOSITORIES);
    });
  });
});
