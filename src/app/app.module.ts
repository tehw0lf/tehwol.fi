import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScullyLibModule } from '@scullyio/ng-lib';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DesktopComponent } from './nav/desktop/desktop.component';
import { MobileComponent } from './nav/mobile/mobile.component';
import { NavComponent } from './nav/nav.component';
import { SidenavService } from './nav/sidenav.service';
import { OcticonDirective } from './octicon.directive';
import { GithubComponent } from './portfolio/github/github.component';
import { GithubService } from './portfolio/github/github.service';
import { RepoCardComponent } from './portfolio/github/repo-card/repo-card.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { WordlistGeneratorComponent } from './wordlist-generator/wordlist-generator.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    DesktopComponent,
    MobileComponent,
    PortfolioComponent,
    GithubComponent,
    RepoCardComponent,
    OcticonDirective,
    WordlistGeneratorComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
    ReactiveFormsModule,
    ClipboardModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    FlexLayoutModule,
    ScullyLibModule
  ],
  providers: [GithubService, SidenavService],
  bootstrap: [AppComponent]
})
export class AppModule {}
