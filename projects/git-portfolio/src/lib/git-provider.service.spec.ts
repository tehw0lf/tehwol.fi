import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GitProviderService } from './git-provider.service';
import { GitProviders, GitRepositories } from './git-repositories-type';
import { GitRepository } from './git-repository-type';

const GIT_REPO = new GitRepository();
const GIT_REPOSITORIES: GitRepositories = {
  github: { own: [GIT_REPO], forked: [GIT_REPO] },
  gitlab: { own: [GIT_REPO], forked: [GIT_REPO] }
};
const GIT_PROVIDER_USER_NAMES = new Map<GitProviders, string>();
GIT_PROVIDER_USER_NAMES.set(GitProviders.github, 'GitHub');
GIT_PROVIDER_USER_NAMES.set(GitProviders.gitlab, 'GitLab');

describe('GitProviderService', () => {
  let service: GitProviderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GitProviderService]
    });
    service = TestBed.inject(GitProviderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch repos', () => {
    service
      .fetchRepositories(GIT_PROVIDER_USER_NAMES)
      .subscribe((githubRepositories: GitRepositories) => {
        expect(githubRepositories).toBe(GIT_REPOSITORIES);
      });

    const reqA = httpMock.expectOne(
      `https://api.github.com/users/${GIT_PROVIDER_USER_NAMES.get(
        GitProviders.github
      )}/repos`
    );
    const reqB = httpMock.expectOne(
      `https://gitlab.com/api/v4/users/${GIT_PROVIDER_USER_NAMES.get(
        GitProviders.gitlab
      )}/projects`
    );

    expect(reqA.request.method).toBe('GET');
    expect(reqB.request.method).toBe('GET');

    reqA.flush(GIT_REPOSITORIES);
    reqB.flush(GIT_REPOSITORIES);

    httpMock.verify();
  });
});
