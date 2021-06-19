import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { PrivacyDialogComponent } from '../privacy-dialog/privacy-dialog.component';

@Component({
  selector: 'app-git-portfolio',
  templateUrl: './git-portfolio.component.html',
  styleUrls: ['./git-portfolio.component.scss']
})
export class GitPortfolioComponent implements OnInit, OnDestroy {
  gitProviderConfig: { github: string; gitlab: string } = {
    github: environment.githubUser,
    gitlab: environment.gitlabUser
  };
  cachedPrivacyDecision = false;
  privacyDialogRef: MatDialogRef<PrivacyDialogComponent, boolean>;
  privacyNoticeAccepted: Observable<boolean>;
  unsubscribe$ = new Subject<void>();

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.cachedPrivacyDecision =
      window.localStorage.getItem('privacyNoticeAccepted') === 'true';

    if (!this.cachedPrivacyDecision) {
      this.createPrivacyDialog();
    } else {
      this.privacyNoticeAccepted = of(true);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private createPrivacyDialog(): void {
    if (!this.privacyDialogRef) {
      this.privacyDialogRef = this.dialog.open(PrivacyDialogComponent);
    }
    this.privacyNoticeAccepted = this.privacyDialogRef.afterClosed().pipe(
      tap((decision) => {
        if (decision === true) {
          window.localStorage.setItem(
            'privacyNoticeAccepted',
            decision.toString()
          );
        } else {
          window.history.back();
        }
      }),
      takeUntil(this.unsubscribe$)
    );
  }
}
