import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { WordlistGeneratorModule } from '@tehw0lf/wordlist-generator';
import { GitPortfolioModule } from '@tehw0lf/git-portfolio';
import { ContactFormModule } from '@tehw0lf/contact-form';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { SidenavService } from './app/nav/sidenav.service';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(AppRoutingModule, BrowserModule, DragDropModule, ReactiveFormsModule, ClipboardModule, MatCardModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatToolbarModule, MatSidenavModule, MatButtonModule, ContactFormModule, GitPortfolioModule, WordlistGeneratorModule),
        SidenavService,
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
  .catch(err => console.error(err));
