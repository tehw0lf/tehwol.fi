import { TestBed } from '@angular/core/testing';
import { Renderer2, RendererFactory2 } from '@angular/core';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockRenderer: jest.Mocked<Renderer2>;
  let mockRendererFactory: jest.Mocked<RendererFactory2>;

  beforeEach(() => {
    mockRenderer = {
      addClass: jest.fn(),
      removeClass: jest.fn(),
    } as any;

    mockRendererFactory = {
      createRenderer: jest.fn().mockReturnValue(mockRenderer),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: RendererFactory2, useValue: mockRendererFactory }
      ]
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with dark theme', () => {
    expect(service.theme()).toBe('dark');
    expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'dark');
  });

  it('should set theme to dark and update document body classes', () => {
    service.dark();
    
    expect(service.theme()).toBe('dark');
    expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'light');
    expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'dark');
  });

  it('should set theme to light and update document body classes', () => {
    service.light();
    
    expect(service.theme()).toBe('light');
    expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'dark');
    expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'light');
  });
});
