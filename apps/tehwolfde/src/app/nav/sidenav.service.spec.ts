import { TestBed } from '@angular/core/testing';
import { MatDrawerToggleResult, MatSidenav } from '@angular/material/sidenav';

import { SidenavService } from './sidenav.service';

describe('SidenavService', () => {
  let service: SidenavService;
  let mockSidenav: jest.Mocked<MatSidenav>;

  beforeEach(() => {
    mockSidenav = {
      open: jest.fn(),
      close: jest.fn(),
      toggle: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [SidenavService]
    });
    service = TestBed.inject(SidenavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setSidenav', () => {
    it('should set the sidenav instance', () => {
      service.setSidenav(mockSidenav);

      // Test that sidenav was set by calling a method that uses it
      service.open();
      expect(mockSidenav.open).toHaveBeenCalled();
    });
  });

  describe('open', () => {
    it('should return Promise when sidenav is set', () => {
      const mockPromise = Promise.resolve({} as MatDrawerToggleResult);
      mockSidenav.open.mockReturnValue(mockPromise);

      service.setSidenav(mockSidenav);
      const result = service.open();

      expect(result).toBe(mockPromise);
      expect(mockSidenav.open).toHaveBeenCalled();
    });

    it('should return undefined when sidenav is not set', () => {
      const result = service.open();

      expect(result).toBeUndefined();
    });
  });

  describe('close', () => {
    it('should return Promise when sidenav is set', () => {
      const mockPromise = Promise.resolve({} as MatDrawerToggleResult);
      mockSidenav.close.mockReturnValue(mockPromise);

      service.setSidenav(mockSidenav);
      const result = service.close();

      expect(result).toBe(mockPromise);
      expect(mockSidenav.close).toHaveBeenCalled();
    });

    it('should return undefined when sidenav is not set', () => {
      const result = service.close();

      expect(result).toBeUndefined();
    });
  });

  describe('toggle', () => {
    it('should return Promise when sidenav is set', () => {
      const mockPromise = Promise.resolve({} as MatDrawerToggleResult);
      mockSidenav.toggle.mockReturnValue(mockPromise);

      service.setSidenav(mockSidenav);
      const result = service.toggle();

      expect(result).toBe(mockPromise);
      expect(mockSidenav.toggle).toHaveBeenCalled();
    });

    it('should return undefined when sidenav is not set', () => {
      const result = service.toggle();

      expect(result).toBeUndefined();
    });
  });
});
