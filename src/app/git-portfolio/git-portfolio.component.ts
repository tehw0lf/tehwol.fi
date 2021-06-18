import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { PrivacyDialogComponent } from '../privacy-dialog/privacy-dialog.component';

@Component({
  selector: 'app-git-portfolio',
  templateUrl: './git-portfolio.component.html',
  styleUrls: ['./git-portfolio.component.scss']
})
export class GitPortfolioComponent implements OnInit {
  gitProviderConfig: { github: string; gitlab: string } = {
    github: environment.githubUser,
    gitlab: environment.gitlabUser
  };
  cachedPrivacyDecision = false;
  privacyNoticeAccepted: Observable<boolean>;

  constructor(private dialog: MatDialog) {
    this.cachedPrivacyDecision =
      window.localStorage.getItem('privacyNoticeAccepted') === 'true';
  }

  ngOnInit(): void {
    if (!this.cachedPrivacyDecision) {
      this.createPrivacyDialog();
    } else {
      this.privacyNoticeAccepted = of(true);
    }
  }

  private createPrivacyDialog(): void {
    const privacyDialogRef: MatDialogRef<PrivacyDialogComponent, boolean> =
      this.dialog.open(PrivacyDialogComponent);
    this.privacyNoticeAccepted = privacyDialogRef
      .afterClosed()
      .pipe(tap((decision) => this.storePrivacyDecision(decision)));
  }

  private storePrivacyDecision(decision: boolean): void {
    window.localStorage.setItem('privacyNoticeAccepted', decision.toString());
  }
}
