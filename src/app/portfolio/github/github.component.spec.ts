import { ClipboardModule } from '@angular/cdk/clipboard';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { of } from 'rxjs';

import { GithubRepository } from './github-repository-type';
import { GithubComponent } from './github.component';
import { GithubService } from './github.service';
import { RepoCardComponent } from './repo-card/repo-card.component';

const GITHUB_REPO: GithubRepository = {
  id: 130134545,
  node_id: 'MDEwOlJlcG9zaXRvcnkxMzAxMzQ1NDU=',
  name: 'airbash',
  full_name: 'tehw0lf/airbash',
  private: false,
  owner: {
    login: 'tehw0lf',
    id: 15650679,
    node_id: 'MDQ6VXNlcjE1NjUwNjc5',
    avatar_url: 'https://avatars2.githubusercontent.com/u/15650679?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/tehw0lf',
    html_url: 'https://github.com/tehw0lf',
    followers_url: 'https://api.github.com/users/tehw0lf/followers',
    following_url:
      'https://api.github.com/users/tehw0lf/following{/other_user}',
    gists_url: 'https://api.github.com/users/tehw0lf/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/tehw0lf/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/tehw0lf/subscriptions',
    organizations_url: 'https://api.github.com/users/tehw0lf/orgs',
    repos_url: 'https://api.github.com/users/tehw0lf/repos',
    events_url: 'https://api.github.com/users/tehw0lf/events{/privacy}',
    received_events_url: 'https://api.github.com/users/tehw0lf/received_events',
    type: 'User',
    site_admin: false
  },
  html_url: 'https://github.com/tehw0lf/airbash',
  description:
    'A POSIX-compliant, fully automated WPA PSK handshake capture script aimed at penetration testing',
  fork: false,
  url: 'https://api.github.com/repos/tehw0lf/airbash',
  forks_url: 'https://api.github.com/repos/tehw0lf/airbash/forks',
  keys_url: 'https://api.github.com/repos/tehw0lf/airbash/keys{/key_id}',
  collaborators_url:
    'https://api.github.com/repos/tehw0lf/airbash/collaborators{/collaborator}',
  teams_url: 'https://api.github.com/repos/tehw0lf/airbash/teams',
  hooks_url: 'https://api.github.com/repos/tehw0lf/airbash/hooks',
  issue_events_url:
    'https://api.github.com/repos/tehw0lf/airbash/issues/events{/number}',
  events_url: 'https://api.github.com/repos/tehw0lf/airbash/events',
  assignees_url:
    'https://api.github.com/repos/tehw0lf/airbash/assignees{/user}',
  branches_url:
    'https://api.github.com/repos/tehw0lf/airbash/branches{/branch}',
  tags_url: 'https://api.github.com/repos/tehw0lf/airbash/tags',
  blobs_url: 'https://api.github.com/repos/tehw0lf/airbash/git/blobs{/sha}',
  git_tags_url: 'https://api.github.com/repos/tehw0lf/airbash/git/tags{/sha}',
  git_refs_url: 'https://api.github.com/repos/tehw0lf/airbash/git/refs{/sha}',
  trees_url: 'https://api.github.com/repos/tehw0lf/airbash/git/trees{/sha}',
  statuses_url: 'https://api.github.com/repos/tehw0lf/airbash/statuses/{sha}',
  languages_url: 'https://api.github.com/repos/tehw0lf/airbash/languages',
  stargazers_url: 'https://api.github.com/repos/tehw0lf/airbash/stargazers',
  contributors_url: 'https://api.github.com/repos/tehw0lf/airbash/contributors',
  subscribers_url: 'https://api.github.com/repos/tehw0lf/airbash/subscribers',
  subscription_url: 'https://api.github.com/repos/tehw0lf/airbash/subscription',
  commits_url: 'https://api.github.com/repos/tehw0lf/airbash/commits{/sha}',
  git_commits_url:
    'https://api.github.com/repos/tehw0lf/airbash/git/commits{/sha}',
  comments_url:
    'https://api.github.com/repos/tehw0lf/airbash/comments{/number}',
  issue_comment_url:
    'https://api.github.com/repos/tehw0lf/airbash/issues/comments{/number}',
  contents_url: 'https://api.github.com/repos/tehw0lf/airbash/contents/{+path}',
  compare_url:
    'https://api.github.com/repos/tehw0lf/airbash/compare/{base}...{head}',
  merges_url: 'https://api.github.com/repos/tehw0lf/airbash/merges',
  archive_url:
    'https://api.github.com/repos/tehw0lf/airbash/{archive_format}{/ref}',
  downloads_url: 'https://api.github.com/repos/tehw0lf/airbash/downloads',
  issues_url: 'https://api.github.com/repos/tehw0lf/airbash/issues{/number}',
  pulls_url: 'https://api.github.com/repos/tehw0lf/airbash/pulls{/number}',
  milestones_url:
    'https://api.github.com/repos/tehw0lf/airbash/milestones{/number}',
  notifications_url:
    'https://api.github.com/repos/tehw0lf/airbash/notifications{?since,all,participating}',
  labels_url: 'https://api.github.com/repos/tehw0lf/airbash/labels{/name}',
  releases_url: 'https://api.github.com/repos/tehw0lf/airbash/releases{/id}',
  deployments_url: 'https://api.github.com/repos/tehw0lf/airbash/deployments',
  created_at: '2018-04-18T23:50:15Z',
  updated_at: '2018-12-20T01:24:29Z',
  pushed_at: '2018-09-30T15:32:41Z',
  git_url: 'git://github.com/tehw0lf/airbash.git',
  ssh_url: 'git@github.com:tehw0lf/airbash.git',
  clone_url: 'https://github.com/tehw0lf/airbash.git',
  svn_url: 'https://github.com/tehw0lf/airbash',
  homepage: '',
  size: 61,
  stargazers_count: 265,
  watchers_count: 265,
  language: 'C',
  has_issues: true,
  has_projects: true,
  has_downloads: true,
  has_wiki: true,
  has_pages: false,
  forks_count: 47,
  mirror_url: null,
  archived: false,
  open_issues_count: 1,
  license: {
    key: 'mit',
    name: 'MIT License',
    spdx_id: 'MIT',
    url: 'https://api.github.com/licenses/mit',
    node_id: 'MDc6TGljZW5zZTEz'
  },
  forks: 47,
  open_issues: 1,
  watchers: 265,
  default_branch: 'master'
};

const githubServiceStub = {
  fetchRepositories() {
    return of([GITHUB_REPO]);
  }
};

describe('GithubComponent', () => {
  let component: GithubComponent;
  let fixture: ComponentFixture<GithubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatCardModule, ClipboardModule],
      declarations: [GithubComponent, RepoCardComponent],
      providers: [{ provide: GithubService, useValue: githubServiceStub }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GithubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy to clipboard', () => {
    component.copyToClipboard(GITHUB_REPO);
    expect(component.currentRepo).toBe(GITHUB_REPO);
    expect(component.isCopiedToClipboard(GITHUB_REPO)).toBeTruthy();
  });
});
