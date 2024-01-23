import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GitPortfolioComponent } from './git-portfolio.component';
import { GitProviderService } from './git-provider.service';
import { OcticonDirective } from './octicon.directive';
import { RepoCardComponent } from './repo-card/repo-card.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ClipboardModule,
    GitPortfolioComponent,
    RepoCardComponent,
    OcticonDirective
  ],
  exports: [GitPortfolioComponent, OcticonDirective],
  providers: [GitProviderService]
})
export class GitPortfolioModule {}
