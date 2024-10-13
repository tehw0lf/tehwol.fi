import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of } from 'rxjs';

import { GitPortfolioComponent } from './git-portfolio.component';
import { GitProviderService } from './git-provider.service';
import { RepoCardComponent } from './repo-card/repo-card.component';
import { GitRepository } from './types/git-repository-type';

const GIT_REPO = new GitRepository();

const gitProviderServiceStub = {
  getRepositories: () => of([GIT_REPO])
};

describe('GitPortfolioComponent', () => {
  let component: GitPortfolioComponent;
  let fixture: ComponentFixture<GitPortfolioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatProgressSpinnerModule,
        MatCardModule,
        ClipboardModule,
        GitPortfolioComponent,
        RepoCardComponent
      ],
      providers: [
        { provide: GitProviderService, useValue: gitProviderServiceStub }
      ]
    }).compileComponents();
  }));

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
