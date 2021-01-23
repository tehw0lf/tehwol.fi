import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { GitPortfolioComponent } from './git-portfolio.component';

@NgModule({
  declarations: [GitPortfolioComponent],
  imports: [MatCardModule, ClipboardModule],
  exports: [GitPortfolioComponent]
})
export class GitPortfolioModule {}
