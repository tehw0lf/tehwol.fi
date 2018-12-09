import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GtSmComponent } from './nav/gt-sm/gt-sm.component';
import { LtMdComponent } from './nav/lt-md/lt-md.component';
import { NavComponent } from './nav/nav.component';
import { SidenavService } from './nav/sidenav.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    GtSmComponent,
    LtMdComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  providers: [SidenavService],
  bootstrap: [AppComponent]
})
export class AppModule {}
