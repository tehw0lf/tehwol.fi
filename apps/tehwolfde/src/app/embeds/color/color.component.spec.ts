import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { ColorComponent } from './color.component';

describe('ColorComponent', () => {
  let component: ColorComponent;
  let fixture: ComponentFixture<ColorComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorComponent],
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'color/:color', component: ColorComponent }])
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    router.initialNavigation();
    fixture = TestBed.createComponent(ColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute hexColor from color signal', () => {
    expect(component.hexColor()).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should compute iframeUrl from color signal', () => {
    expect(component.iframeUrl()).toContain('https://color.tehwolf.de/');
  });

  it('should apply new color and navigate', async () => {
    component.inputValue.set('ff0000');
    component.apply();
    expect(component.color()).toBe('ff0000');
  });

  it('should not apply when inputValue is empty', () => {
    component.color.set('aabbcc');
    component.inputValue.set('   ');
    component.apply();
    expect(component.color()).toBe('aabbcc');
  });
});
