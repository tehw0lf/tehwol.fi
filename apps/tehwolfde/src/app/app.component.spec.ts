import { TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { DesktopComponent } from './components/nav/desktop/desktop.component';
import { MobileComponent } from './components/nav/mobile/mobile.component';
import { NavComponent } from './components/nav/nav.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule, // eslint-disable-line @typescript-eslint/no-deprecated
        MatIconModule,
        MatListModule,
        MatToolbarModule,
        MatSidenavModule,
        AppComponent,
        HomeComponent,
        NavComponent,
        MobileComponent,
        DesktopComponent
      ],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
