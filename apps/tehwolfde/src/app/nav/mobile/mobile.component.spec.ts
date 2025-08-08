import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';

import { SidenavService } from '../sidenav.service';
import { MobileComponent } from './mobile.component';

const mockSidenavService = {
  setSidenav: jest.fn(),
  toggle: jest.fn(),
  close: jest.fn()
};

describe('MobileComponent', () => {
  let component: MobileComponent;
  let fixture: ComponentFixture<MobileComponent>;
  let router: Router;

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
        provideRouter([
          { path: '', component: MobileComponent },
          { path: 'home', component: MobileComponent },
          { path: 'other', component: MobileComponent }
        ]),
        { provide: SidenavService, useValue: mockSidenavService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should call setSidenav with sidenav when sidenav exists', () => {
      const mockSidenav = { close: jest.fn() } as any;
      jest.clearAllMocks(); // Clear any previous calls
      component.sidenav = mockSidenav;

      component.ngAfterViewInit();

      expect(mockSidenavService.setSidenav).toHaveBeenCalledWith(mockSidenav);
    });

    it('should not call setSidenav when sidenav is undefined', () => {
      jest.clearAllMocks(); // Clear any previous calls
      component.sidenav = undefined;

      component.ngAfterViewInit();

      expect(mockSidenavService.setSidenav).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should call unsubscribe$.next and unsubscribe$.complete', () => {
      const nextSpy = jest.spyOn(component['unsubscribe$'], 'next');
      const completeSpy = jest.spyOn(component['unsubscribe$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('isActive', () => {
    it('should return true when router is active on root path', async () => {
      await router.navigate(['']);

      const result = component.isActive();

      expect(result).toBe(true);
    });

    it('should return true when router is active on /home path', async () => {
      await router.navigate(['/home']);

      const result = component.isActive();

      expect(result).toBe(true);
    });

    it('should return false when router is active on other path', async () => {
      await router.navigate(['/other']);

      const result = component.isActive();

      expect(result).toBe(false);
    });
  });

  it('should toggle the sidenav', () => {
    component.toggleSidenav();
    expect(mockSidenavService.toggle).toHaveBeenCalled();
  });

  it('should call sidenavService.close when closeSidenav is called', () => {
    component.closeSidenav();
    expect(mockSidenavService.close).toHaveBeenCalled();
  });

  it('should call themeService.light when switchToLight is called', () => {
    const themeServiceSpy = jest.spyOn(component.themeService, 'light');
    component.switchToLight();
    expect(themeServiceSpy).toHaveBeenCalled();
  });

  it('should call themeService.dark when switchToDark is called', () => {
    const themeServiceSpy = jest.spyOn(component.themeService, 'dark');
    component.switchToDark();
    expect(themeServiceSpy).toHaveBeenCalled();
  });
});
