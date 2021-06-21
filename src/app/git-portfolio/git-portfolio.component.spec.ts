import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgGitPortfolioModule } from '@tehw0lf/ng-git-portfolio';
import { of } from 'rxjs';

import { PrivacyDialogComponent } from '../privacy-dialog/privacy-dialog.component';
import { GitPortfolioComponent } from './git-portfolio.component';

let decision: boolean;

const mockMatDialog = {
  open: jest.fn(() => {
    return {
      afterClosed: () => of(decision)
    };
  })
};

describe('GitPortfolioComponent', () => {
  let component: GitPortfolioComponent;
  let fixture: ComponentFixture<GitPortfolioComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NgGitPortfolioModule, MatDialogModule],
        declarations: [GitPortfolioComponent, PrivacyDialogComponent],
        providers: [{ provide: MatDialog, useValue: mockMatDialog }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GitPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open a modal', () => {
    expect(mockMatDialog.open).toHaveBeenCalledWith(PrivacyDialogComponent);
  });

  it('should open only one modal', () => {
    component.ngOnInit();
    expect(mockMatDialog.open).toHaveBeenNthCalledWith(
      1,
      PrivacyDialogComponent
    );
  });

  it('should retrieve the saved decision', () => {
    window.localStorage.setItem('privacyNoticeAccepted', 'true');
    component.ngOnInit();
    expect(component.cachedPrivacyDecision).toBeTruthy();
  });

  describe('should deny the privacy notice', () => {
    beforeEach(() => {
      decision = false;

      fixture = TestBed.createComponent(GitPortfolioComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it(' ', () => {
      expect(mockMatDialog.open).toHaveBeenCalledWith(PrivacyDialogComponent);
      expect(window.localStorage.getItem('privacyNoticeAccepted')).toBeNull();
    });
  });

  describe('should accept the privacy notice', () => {
    beforeEach(() => {
      decision = true;

      fixture = TestBed.createComponent(GitPortfolioComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it(' ', () => {
      expect(mockMatDialog.open).toHaveBeenCalledWith(PrivacyDialogComponent);
      expect(window.localStorage.getItem('privacyNoticeAccepted')).toEqual(
        'true'
      );
    });
  });
});
