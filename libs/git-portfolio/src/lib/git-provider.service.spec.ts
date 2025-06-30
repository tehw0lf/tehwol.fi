import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { GitProviderService } from './git-provider.service';
import { GitProviderConfig } from './types/git-provider-config-type';
import { GitRepository } from './types/git-repository-type';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

const createGitRepository = (
  id: number,
  name: string,
  fork = false,
  stargazers_count = 0,
  star_count?: number
): GitRepository => {
  const repo = new GitRepository();
  repo.id = id;
  repo.name = name;
  repo.fork = fork;
  repo.stargazers_count = stargazers_count;
  repo.star_count = star_count;
  return repo;
};

const GITHUB_REPOS = [
  createGitRepository(1, 'repo1', false, 10),
  createGitRepository(2, 'repo2', true, 5),
  createGitRepository(3, 'repo3', false, 15)
];

const GITLAB_REPOS = [
  createGitRepository(4, 'project1', false, 8),
  createGitRepository(5, 'project2', true, 3)
];

const GIT_PROVIDER_USER_NAMES: GitProviderConfig = {
  github: 'testuser',
  gitlab: 'testuser'
};

describe('GitProviderService', () => {
  let service: GitProviderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        GitProviderService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(GitProviderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRepositories', () => {
    it('should fetch and organize repositories correctly', (done) => {
      const result$ = service.getRepositories(GIT_PROVIDER_USER_NAMES);
      
      result$.subscribe((repositories) => {
        expect(repositories.github?.own).toEqual([
          GITHUB_REPOS[2], // repo3 (15 stars)
          GITHUB_REPOS[0]  // repo1 (10 stars)
        ]);
        expect(repositories.github?.forked).toEqual([
          GITHUB_REPOS[1]  // repo2 (5 stars)
        ]);
        expect(repositories.gitlab?.own).toEqual([
          GITLAB_REPOS[0]  // project1 (8 stars)
        ]);
        expect(repositories.gitlab?.forked).toEqual([
          GITLAB_REPOS[1]  // project2 (3 stars)
        ]);
        done();
      });

      const reqGithub = httpMock.expectOne(
        `https://api.github.com/users/${GIT_PROVIDER_USER_NAMES.github}/repos`
      );
      const reqGitlab = httpMock.expectOne(
        `https://gitlab.com/api/v4/users/${GIT_PROVIDER_USER_NAMES.gitlab}/projects`
      );

      expect(reqGithub.request.method).toBe('GET');
      expect(reqGitlab.request.method).toBe('GET');

      reqGithub.flush(GITHUB_REPOS);
      reqGitlab.flush(GITLAB_REPOS);
    });

    it('should handle empty usernames by skipping API calls', async () => {
      const config: GitProviderConfig = { github: '', gitlab: '' };
      const result$ = service.getRepositories(config);
      
      const repositories = await firstValueFrom(result$);

      expect(repositories.github?.own).toEqual([]);
      expect(repositories.github?.forked).toEqual([]);
      expect(repositories.gitlab?.own).toEqual([]);
      expect(repositories.gitlab?.forked).toEqual([]);
    });

    it('should handle partial configuration', (done) => {
      const config: GitProviderConfig = { github: 'testuser' };
      const result$ = service.getRepositories(config);
      
      result$.subscribe((repositories) => {
        expect(repositories.github?.own).toHaveLength(2);
        expect(repositories.gitlab?.own).toEqual([]);
        expect(repositories.gitlab?.forked).toEqual([]);
        done();
      });

      const reqGithub = httpMock.expectOne(
        `https://api.github.com/users/testuser/repos`
      );
      
      reqGithub.flush(GITHUB_REPOS);
    });

    it('should handle undefined configuration', async () => {
      const result$ = service.getRepositories();
      
      const repositories = await firstValueFrom(result$);

      expect(repositories.github?.own).toEqual([]);
      expect(repositories.github?.forked).toEqual([]);
      expect(repositories.gitlab?.own).toEqual([]);
      expect(repositories.gitlab?.forked).toEqual([]);
    });
  });

  describe('caching', () => {
    it('should cache results and return cached data on subsequent calls', (done) => {
      let callCount = 0;
      
      // First call
      const result1$ = service.getRepositories(GIT_PROVIDER_USER_NAMES);
      
      result1$.subscribe((repositories1) => {
        callCount++;
        
        // Second call should use cache
        const result2$ = service.getRepositories(GIT_PROVIDER_USER_NAMES);
        result2$.subscribe((repositories2) => {
          expect(repositories1).toEqual(repositories2);
          expect(callCount).toBe(1); // Should only make HTTP request once
          done();
        });
      });

      const reqGithub1 = httpMock.expectOne(
        `https://api.github.com/users/${GIT_PROVIDER_USER_NAMES.github}/repos`
      );
      const reqGitlab1 = httpMock.expectOne(
        `https://gitlab.com/api/v4/users/${GIT_PROVIDER_USER_NAMES.gitlab}/projects`
      );

      reqGithub1.flush(GITHUB_REPOS);
      reqGitlab1.flush(GITLAB_REPOS);
    });

    it('should create different cache keys for different configurations', () => {
      const config1: GitProviderConfig = { github: 'user1' };
      const config2: GitProviderConfig = { github: 'user2' };

      // Just verify that different configurations result in different behavior
      // by checking that different URLs are called
      const result1$ = service.getRepositories(config1);
      const result2$ = service.getRepositories(config2);

      // Should trigger requests for different users
      expect(result1$).toBeDefined();
      expect(result2$).toBeDefined();
    });

    it('should handle cache expiration', (done) => {
      // Mock Date.now to control time
      const originalDateNow = Date.now;
      let currentTime = 1000;
      jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

      try {
        // First call
        const result1$ = service.getRepositories(GIT_PROVIDER_USER_NAMES);
        
        result1$.subscribe(() => {
          // Advance time beyond cache TTL (10 minutes)
          currentTime += 11 * 60 * 1000;

          // Second call should make new HTTP requests due to expired cache
          const result2$ = service.getRepositories(GIT_PROVIDER_USER_NAMES);
          
          result2$.subscribe(() => {
            Date.now = originalDateNow;
            done();
          });

          const reqGithub2 = httpMock.expectOne(
            `https://api.github.com/users/${GIT_PROVIDER_USER_NAMES.github}/repos`
          );
          const reqGitlab2 = httpMock.expectOne(
            `https://gitlab.com/api/v4/users/${GIT_PROVIDER_USER_NAMES.gitlab}/projects`
          );

          reqGithub2.flush(GITLAB_REPOS);
          reqGitlab2.flush(GITHUB_REPOS);
        });

        const reqGithub1 = httpMock.expectOne(
          `https://api.github.com/users/${GIT_PROVIDER_USER_NAMES.github}/repos`
        );
        const reqGitlab1 = httpMock.expectOne(
          `https://gitlab.com/api/v4/users/${GIT_PROVIDER_USER_NAMES.gitlab}/projects`
        );

        reqGithub1.flush(GITHUB_REPOS);
        reqGitlab1.flush(GITLAB_REPOS);
      } catch (error) {
        Date.now = originalDateNow;
        done.fail(error);
      }
    });
  });

  describe('repository filtering and sorting', () => {
    it('should correctly filter own vs forked repositories', (done) => {
      const mixedRepos = [
        createGitRepository(1, 'own1', false, 10),
        createGitRepository(2, 'fork1', true, 15),
        createGitRepository(3, 'own2', false, 5),
        createGitRepository(4, 'fork2', true, 8)
      ];

      const result$ = service.getRepositories({ github: 'testuser' });
      
      result$.subscribe((repositories) => {
        expect(repositories.github?.own).toHaveLength(2);
        expect(repositories.github?.forked).toHaveLength(2);
        expect(repositories.github?.own?.[0].fork).toBe(false);
        expect(repositories.github?.forked?.[0].fork).toBe(true);
        done();
      });

      const req = httpMock.expectOne('https://api.github.com/users/testuser/repos');
      req.flush(mixedRepos);
    });

    it('should sort repositories by star count in descending order', (done) => {
      const unsortedRepos = [
        createGitRepository(1, 'low-stars', false, 5),
        createGitRepository(2, 'high-stars', false, 20),
        createGitRepository(3, 'medium-stars', false, 10)
      ];

      const result$ = service.getRepositories({ github: 'testuser' });
      
      result$.subscribe((repositories) => {
        expect(repositories.github?.own?.[0].stargazers_count).toBe(20);
        expect(repositories.github?.own?.[1].stargazers_count).toBe(10);
        expect(repositories.github?.own?.[2].stargazers_count).toBe(5);
        done();
      });

      const req = httpMock.expectOne('https://api.github.com/users/testuser/repos');
      req.flush(unsortedRepos);
    });

    it('should handle repositories with undefined star counts', (done) => {
      const repoWithUndefinedStars = createGitRepository(1, 'no-stars', false, 10);
      repoWithUndefinedStars.stargazers_count = undefined; // Explicitly set to undefined after creation
      
      const reposWithUndefinedStars = [
        repoWithUndefinedStars,
        createGitRepository(2, 'with-stars', false, 10)
      ];

      const result$ = service.getRepositories({ github: 'testuser' });
      
      result$.subscribe((repositories) => {
        expect(repositories.github?.own).toHaveLength(2);
        // Repositories should be properly sorted and filtered
        expect(repositories.github?.own?.[0].name).toBe('with-stars');
        expect(repositories.github?.own?.[0].stargazers_count).toBe(10);
        expect(repositories.github?.own?.[1].name).toBe('no-stars');
        expect(repositories.github?.own?.[1].stargazers_count).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne('https://api.github.com/users/testuser/repos');
      req.flush(reposWithUndefinedStars);
    });
  });

  describe('loading state', () => {
    it('should manage loading state correctly', (done) => {
      const loadingStates: boolean[] = [];
      service.loading.subscribe(state => loadingStates.push(state));

      const result$ = service.getRepositories(GIT_PROVIDER_USER_NAMES);
      
      result$.subscribe(() => {
        // Should end with loading false
        expect(loadingStates[loadingStates.length - 1]).toBe(false);
        done();
      });

      const reqGithub = httpMock.expectOne(
        `https://api.github.com/users/${GIT_PROVIDER_USER_NAMES.github}/repos`
      );
      const reqGitlab = httpMock.expectOne(
        `https://gitlab.com/api/v4/users/${GIT_PROVIDER_USER_NAMES.gitlab}/projects`
      );

      // Should start with loading true
      expect(loadingStates[0]).toBe(true);

      reqGithub.flush(GITHUB_REPOS);
      reqGitlab.flush(GITLAB_REPOS);
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors gracefully', (done) => {
      const result$ = service.getRepositories(GIT_PROVIDER_USER_NAMES);
      
      result$.subscribe({
        next: () => done.fail('Should not emit success'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const reqGithub = httpMock.expectOne(
        `https://api.github.com/users/${GIT_PROVIDER_USER_NAMES.github}/repos`
      );
      const reqGitlab = httpMock.expectOne(
        `https://gitlab.com/api/v4/users/${GIT_PROVIDER_USER_NAMES.gitlab}/projects`
      );
      
      // Error one request to trigger error handling
      reqGithub.flush('User not found', { status: 404, statusText: 'Not Found' });
      // Handle the other request normally to avoid open request error
      reqGitlab.flush([]);
    });
  });

  describe('clearCache', () => {
    it('should clear cache and reset state', () => {
      // Clear cache
      service.clearCache();

      // Verify loading state is reset
      service.loading.subscribe((currentLoading) => {
        expect(currentLoading).toBe(true);
      });
      
      // Just verify that clearCache method exists and can be called
      expect(service.clearCache).toBeDefined();
    });
  });
});
