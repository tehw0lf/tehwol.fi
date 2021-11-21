import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GitProviderService } from './git-provider.service';
import { GitProviderConfig } from './types/git-provider-config-type';
import { GitRepositories } from './types/git-repositories-type';
import { GitRepository } from './types/git-repository-type';

const GIT_REPO_ARRAY = [new GitRepository()];
const GIT_REPOSITORIES: GitRepositories = {
  github: { own: [new GitRepository()], forked: [] },
  gitlab: { own: [new GitRepository()], forked: [] }
};
const GIT_PROVIDER_USER_NAMES: GitProviderConfig = {
  github: 'github',
  gitlab: 'gitlab'
};

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

  it('should get repos', (done) => {
    service
      .getRepositories(GIT_PROVIDER_USER_NAMES)
      .subscribe((githubRepositories: GitRepositories) => {
        expect(githubRepositories).toEqual(GIT_REPOSITORIES);
        done();
      });

    const reqA = httpMock.expectOne(
      `https://api.github.com/users/${GIT_PROVIDER_USER_NAMES.github}/repos`
    );
    const reqB = httpMock.expectOne(
      `https://gitlab.com/api/v4/users/${GIT_PROVIDER_USER_NAMES.gitlab}/projects`
    );

    expect(reqA.request.method).toBe('GET');
    expect(reqB.request.method).toBe('GET');

    reqA.flush(GIT_REPO_ARRAY);
    reqB.flush(GIT_REPO_ARRAY);

    httpMock.verify();
  });
});
