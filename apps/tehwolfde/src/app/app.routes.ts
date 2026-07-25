import { Routes } from '@angular/router';

import { EMBEDDED_APPS } from './embeds/apps';

/**
 * The simple embeds differ only in url and title, so they are generated from
 * EMBEDDED_APPS and bound to EmbedComponent's inputs via the route.
 */
const embedRoutes: Routes = EMBEDDED_APPS.filter(
  (app) => !app.hasCustomRoute
).map((app) => ({
  path: app.slug,
  loadComponent: () =>
    import('./embeds/embed/embed.component').then((m) => m.EmbedComponent),
  data: { url: app.url, title: app.title }
}));

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./showcases/git-portfolio/git-portfolio.component').then(
        (m) => m.GitPortfolioComponent
      )
  },
  {
    path: 'wordlist-generator',
    loadComponent: () =>
      import('./showcases/wordlist-generator/wordlist-generator.component').then(
        (m) => m.WordlistGeneratorComponent
      )
  },
  {
    path: 'contact-form',
    loadComponent: () =>
      import('./showcases/contact-form/contact-form.component').then(
        (m) => m.ContactFormComponent
      )
  },
  ...embedRoutes,
  {
    path: 'color/:color',
    loadComponent: () =>
      import('./embeds/color/color.component').then((m) => m.ColorComponent)
  },
  {
    path: 'color',
    loadComponent: () =>
      import('./embeds/color/color.component').then((m) => m.ColorComponent)
  }
];
