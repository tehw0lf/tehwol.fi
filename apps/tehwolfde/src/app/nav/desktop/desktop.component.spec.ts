import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideRouter } from '@angular/router';

import { SidenavService } from '../sidenav.service';
import { DesktopComponent } from './desktop.component';

const mockSidenavService = {
  toggle: jest.fn()
};

describe('DesktopComponent', () => {
  let component: DesktopComponent;
  let fixture: ComponentFixture<DesktopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconModule, MatToolbarModule, DesktopComponent],
      providers: [
        provideRouter([]),
        { provide: SidenavService, useValue: mockSidenavService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
