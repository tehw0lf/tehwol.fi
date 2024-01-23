import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ContactFormModule } from '@tehw0lf/contact-form';
import { GitPortfolioModule } from '@tehw0lf/git-portfolio';
import { WordlistGeneratorModule } from '@tehw0lf/wordlist-generator';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SidenavService } from './app/nav/sidenav.service';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      DragDropModule,
      ReactiveFormsModule,
      ClipboardModule,
      MatCardModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      MatMenuModule,
      MatToolbarModule,
      MatSidenavModule,
      MatButtonModule,
      ContactFormModule,
      GitPortfolioModule,
      WordlistGeneratorModule
    ),
    SidenavService,
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes)
  ]
}).catch((err) => console.error(err));
