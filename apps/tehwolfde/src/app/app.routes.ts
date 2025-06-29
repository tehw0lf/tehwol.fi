import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'home', 
    pathMatch: 'full' 
  },
  { 
    path: 'home', 
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'portfolio', 
    loadComponent: () => import('./git-portfolio/git-portfolio.component').then(m => m.GitPortfolioComponent)
  },
  { 
    path: 'wordlist-generator', 
    loadComponent: () => import('./wordlist-generator/wordlist-generator.component').then(m => m.WordlistGeneratorComponent)
  },
  { 
    path: 'contact-form', 
    loadComponent: () => import('./contact-form/contact-form.component').then(m => m.ContactFormComponent)
  }
];
