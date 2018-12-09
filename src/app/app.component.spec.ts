import { async, TestBed } from '@angular/core/testing';
import { MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GtSmComponent } from './nav/gt-sm/gt-sm.component';
import { LtMdComponent } from './nav/lt-md/lt-md.component';
import { NavComponent } from './nav/nav.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatListModule,
        MatToolbarModule,
        MatSidenavModule
      ],
      declarations: [
        AppComponent,
        HomeComponent,
        NavComponent,
        LtMdComponent,
        GtSmComponent
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'tehwol.fi'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('tehwol.fi');
  });
});
