import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NgGitPortfolioModule } from '@tehw0lf/ng-git-portfolio';

import { PrivacyDialogComponent } from '../privacy-dialog/privacy-dialog.component';
import { GitPortfolioComponent } from './git-portfolio.component';

describe('GitPortfolioComponent', () => {
  let component: GitPortfolioComponent;
  let fixture: ComponentFixture<GitPortfolioComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NgGitPortfolioModule, MatDialogModule],
        declarations: [GitPortfolioComponent, PrivacyDialogComponent]
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
});
