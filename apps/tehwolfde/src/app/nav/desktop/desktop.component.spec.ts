import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { SidenavService } from '../sidenav.service';
import { DesktopComponent } from './desktop.component';

const mockSidenavService = {
  toggle: jest.fn()
};

const mockBreakpointObserver = {
  observe: jest.fn()
};

describe('DesktopComponent', () => {
  let component: DesktopComponent;
  let fixture: ComponentFixture<DesktopComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LayoutModule,
        MatIconModule,
        MatToolbarModule,
        DesktopComponent
      ],
      providers: [
        provideRouter([
          { path: '', component: DesktopComponent },
          { path: 'home', component: DesktopComponent },
          { path: 'other', component: DesktopComponent }
        ]),
        { provide: SidenavService, useValue: mockSidenavService },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    // Mock breakpoint observer to return observable
    mockBreakpointObserver.observe.mockReturnValue(
      of({ matches: false, breakpoints: {} })
    );

    fixture = TestBed.createComponent(DesktopComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  describe('computed styles', () => {
    it('should show burger when screen is not large', () => {
      expect(component.burgerStyle()).toBe('');
      expect(component.buttonStyle()).toBe('display: none;');
    });

    it('should hide burger when screen is large', () => {
      // Create new component instance with large screen breakpoint
      mockBreakpointObserver.observe.mockReturnValue(
        of({ matches: true, breakpoints: {} })
      );

      // Recreate component to pick up new breakpoint behavior
      const newFixture = TestBed.createComponent(DesktopComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.burgerStyle()).toBe('display: none;');
      expect(newComponent.buttonStyle()).toBe('');
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

  it('should toggle sidenav', () => {
    component.toggleSidenav();
    expect(mockSidenavService.toggle).toHaveBeenCalled();
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
