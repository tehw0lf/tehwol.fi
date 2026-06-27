import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { NoPreloading, provideRouter, withPreloading } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SidenavService } from './app/components/nav/sidenav.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    SidenavService,
    provideHttpClient(withXhr()),
    provideRouter(routes, withPreloading(NoPreloading))
  ]
}).catch((err) => console.error(err));
