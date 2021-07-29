import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GitProviderService } from './git-provider.service';
import { NgGitPortfolioComponent } from './ng-git-portfolio.component';
import { OcticonDirective } from './octicon.directive';
import { RepoCardComponent } from './repo-card/repo-card.component';

@NgModule({
  declarations: [NgGitPortfolioComponent, RepoCardComponent, OcticonDirective],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ClipboardModule,
    FlexLayoutModule
  ],
  exports: [NgGitPortfolioComponent, OcticonDirective],
  providers: [GitProviderService]
})
export class NgGitPortfolioModule {}
