import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { GithubRepository } from './github-repository-type';
import { GithubService } from './github.service';

const API_URL = environment.API_URL;
const GITHUB_USER = environment.GITHUB_USER;
const GITHUB_REPO = new GithubRepository();
const GITHUB_REPOS = [GITHUB_REPO];

describe('GithubService', () => {
  let service: GithubService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubService]
    });
    service = TestBed.inject(GithubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch repos', () => {
    service.fetchRepositories().subscribe((githubRepos: GithubRepository[]) => {
      expect(githubRepos).toBe(GITHUB_REPOS);
    });

    const req = httpMock.expectOne(`${API_URL}/users/${GITHUB_USER}/repos`);
    expect(req.request.method).toBe('GET');

    req.flush(GITHUB_REPOS);

    httpMock.verify();
  });
});
