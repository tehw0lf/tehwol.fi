import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SidenavService } from './app/nav/sidenav.service';

bootstrapApplication(AppComponent, {
  providers: [
    SidenavService,
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes)
  ]
}).catch((err) => console.error(err));
