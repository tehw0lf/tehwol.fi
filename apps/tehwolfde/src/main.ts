import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SidenavService } from './app/components/nav/sidenav.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    SidenavService,
    // TODO: Migrate to native CSS animations when Angular Material supports it (v23+)
    // See: https://angular.dev/guide/animations/migration
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    provideAnimations(),
    provideHttpClient(withXhr()),
    provideRouter(routes, withPreloading(PreloadAllModules))
  ]
}).catch((err) => console.error(err));
