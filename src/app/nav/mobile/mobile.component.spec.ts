import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule, MatListModule, MatSidenavModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { MobileComponent } from './mobile.component';

describe('MobileComponent', () => {
  let component: MobileComponent;
  let fixture: ComponentFixture<MobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule
      ],
      declarations: [MobileComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
