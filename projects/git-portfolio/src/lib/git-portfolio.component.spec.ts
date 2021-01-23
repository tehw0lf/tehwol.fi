import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { of } from 'rxjs';

import { GitPortfolioComponent } from './git-portfolio.component';
import { GitProviderService } from './git-provider.service';
import { GitRepository } from './git-repository-type';
import { RepoCardComponent } from './repo-card/repo-card.component';

const GIT_REPO = new GitRepository();

const gitProviderServiceStub = {
  fetchRepositories: () => {
    return of([GIT_REPO]);
  }
};

describe('GitProviderComponent', () => {
  let component: GitPortfolioComponent;
  let fixture: ComponentFixture<GitPortfolioComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatCardModule, ClipboardModule],
        declarations: [GitPortfolioComponent, RepoCardComponent],
        providers: [
          { provide: GitProviderService, useValue: gitProviderServiceStub }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GitPortfolioComponent);
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
