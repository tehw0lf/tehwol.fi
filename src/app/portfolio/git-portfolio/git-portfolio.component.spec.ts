import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { of } from 'rxjs';

import { GitProviderComponent } from './git-portfolio.component';
import { GitProviderService } from './git-provider.service';
import { GitRepositories } from './git-repositories-type';
import { GitRepository } from './git-repository-type';
import { RepoCardComponent } from './repo-card/repo-card.component';

const GIT_REPO = new GitRepository();
const GIT_REPOSITORIES: GitRepositories = {
  github: { own: [GIT_REPO], forked: [GIT_REPO] },
  gitlab: { own: [GIT_REPO], forked: [GIT_REPO] }
};

const gitProviderServiceStub = {
  fetchRepositories() {
    return of([GIT_REPO]);
  }
};

describe('GitProviderComponent', () => {
  let component: GitProviderComponent;
  let fixture: ComponentFixture<GitProviderComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatCardModule, ClipboardModule],
        declarations: [GitProviderComponent, RepoCardComponent],
        providers: [
          { provide: GitProviderService, useValue: gitProviderServiceStub }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GitProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy to clipboard', () => {
    component.copyToClipboard(GIT_REPO);
    expect(component.currentRepo).toBe(GIT_REPO);
    expect(component.isCopiedToClipboard(GIT_REPO)).toBeTruthy();
  });
});
