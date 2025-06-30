import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { SidenavService } from '../sidenav.service';
import { MobileComponent } from './mobile.component';

const mockSidenavService = {
  setSidenav: jest.fn(),
  toggle: jest.fn()
};

describe('MobileComponent', () => {
  let component: MobileComponent;
  let fixture: ComponentFixture<MobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MobileComponent
      ],
      providers: [
        provideRouter([]),
        { provide: SidenavService, useValue: mockSidenavService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the sidenav', () => {
    component.toggleSidenav();
    expect(mockSidenavService.toggle).toHaveBeenCalled();
  });
});
