import { Routes } from '@angular/router';

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
  {
    path: 'beep',
    loadComponent: () =>
      import('./embeds/beep/beep.component').then(
        (m) => m.BeepSimulatorComponent
      )
  },
  {
    path: 'flowdive',
    loadComponent: () =>
      import('./embeds/flowdive/flowdive.component').then(
        (m) => m.FlowdiveComponent
      )
  },
  {
    path: 'numveil',
    loadComponent: () =>
      import('./embeds/numveil/numveil.component').then(
        (m) => m.NumveilComponent
      )
  },
  {
    path: 'mutuals',
    loadComponent: () =>
      import('./embeds/mutuals/mutuals.component').then(
        (m) => m.MutualsComponent
      )
  },
  {
    path: 'btrain',
    loadComponent: () =>
      import('./embeds/btrain/btrain.component').then((m) => m.BtrainComponent)
  },
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
