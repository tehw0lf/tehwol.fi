import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GitPortfolioComponent } from './git-portfolio/git-portfolio.component';
import { HomeComponent } from './home/home.component';
import { WordlistGeneratorComponent } from './wordlist-generator/wordlist-generator.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "home", component: HomeComponent },
  { path: "portfolio", component: GitPortfolioComponent },
  { path: "wordlist-generator", component: WordlistGeneratorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
