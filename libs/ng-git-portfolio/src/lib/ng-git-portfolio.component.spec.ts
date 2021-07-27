import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { of } from 'rxjs';

import { GitProviderService } from './git-provider.service';
import { GitRepository } from './git-repository-type';
import { NgGitPortfolioComponent } from './ng-git-portfolio.component';
import { RepoCardComponent } from './repo-card/repo-card.component';

const GIT_REPO = new GitRepository();

const gitProviderServiceStub = {
  getRepositories: () => of([GIT_REPO])
};

describe('NgGitPortfolioComponent', () => {
  let component: NgGitPortfolioComponent;
  let fixture: ComponentFixture<NgGitPortfolioComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatCardModule, ClipboardModule],
        declarations: [NgGitPortfolioComponent, RepoCardComponent],
        providers: [
          { provide: GitProviderService, useValue: gitProviderServiceStub }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NgGitPortfolioComponent);
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
