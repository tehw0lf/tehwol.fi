import { Routes } from '@angular/router';

import { GitPortfolioComponent } from './git-portfolio/git-portfolio.component';
import { HomeComponent } from './home/home.component';
import { WordlistGeneratorComponent } from './wordlist-generator/wordlist-generator.component';

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "home", component: HomeComponent },
  { path: "portfolio", component: GitPortfolioComponent },
  { path: "wordlist-generator", component: WordlistGeneratorComponent },
];
