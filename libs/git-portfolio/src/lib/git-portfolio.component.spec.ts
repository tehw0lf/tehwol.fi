import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject, of } from 'rxjs';

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
      expect(component.buttonStyle()).toEqual({ 'background-color': '#424242', color: '#cc7832' });
      expect(component.cardStyle()).toEqual({
        color: '#437da8',
        'background-color': 'rgba(34, 34, 34, 0.75)',
        'backdrop-filter': 'blur(50px)'
      });
      expect(component.textStyle()).toEqual({ color: '#437da8' });
      expect(component.checkColor()).toBe('#38e038');
      expect(component.forkColor()).toBe('#437da8');
      expect(component.issueColor()).toBe('rgb(56, 224, 56)');
      expect(component.pasteColor()).toBe('#cc7832');
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
});
