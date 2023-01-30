import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ScullyLibModule } from '@scullyio/ng-lib';
import { ContactFormModule } from '@tehw0lf/contact-form';
import { GitPortfolioModule } from '@tehw0lf/git-portfolio';
import { WordlistGeneratorModule } from '@tehw0lf/wordlist-generator';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { GitPortfolioComponent } from './git-portfolio/git-portfolio.component';
import { HomeComponent } from './home/home.component';
import { DesktopComponent } from './nav/desktop/desktop.component';
import { MobileComponent } from './nav/mobile/mobile.component';
import { NavComponent } from './nav/nav.component';
import { SidenavService } from './nav/sidenav.service';
import { WordlistGeneratorComponent } from './wordlist-generator/wordlist-generator.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    DesktopComponent,
    MobileComponent,
    ContactFormComponent,
    GitPortfolioComponent,
    WordlistGeneratorComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    DragDropModule,
    ReactiveFormsModule,
    ClipboardModule,
    HttpClientModule,
    ContactFormModule,
    GitPortfolioModule,
    WordlistGeneratorModule,
    ScullyLibModule,
    NgbModule
  ],
  providers: [SidenavService],
  bootstrap: [AppComponent]
})
export class AppModule {}
