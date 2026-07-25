import {
  ComponentFixture,
  DeferBlockBehavior,
  TestBed
} from '@angular/core/testing';
import { SafeResourceUrl } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { EMBEDDED_APPS } from '../../embeds/apps';
import { AppCarouselComponent } from './app-carousel.component';

/** Unwraps the string a bypassSecurityTrustResourceUrl value was built from. */
function sanitizerValue(url: SafeResourceUrl): string {
  return String((url as { changingThisBreaksApplicationSecurity?: string })
    .changingThisBreaksApplicationSecurity);
}

describe('AppCarouselComponent', () => {
  let component: AppCarouselComponent;
  let fixture: ComponentFixture<AppCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCarouselComponent],
      providers: [provideRouter([])],
      deferBlockBehavior: DeferBlockBehavior.Manual
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on the first slide with back disabled', () => {
    expect(component.activeIndex()).toBe(0);
    expect(component.canScrollBack()).toBe(false);
    expect(component.canScrollForward()).toBe(true);
  });

  it('should advance and go back', () => {
    component.scrollBy(1);
    expect(component.activeIndex()).toBe(1);
    expect(component.canScrollBack()).toBe(true);

    component.scrollBy(-1);
    expect(component.activeIndex()).toBe(0);
  });

  it('should clamp at both ends', () => {
    component.scrollBy(-1);
    expect(component.activeIndex()).toBe(0);

    component.scrollTo(component.apps.length + 5);
    expect(component.activeIndex()).toBe(component.apps.length - 1);
    expect(component.canScrollForward()).toBe(false);
  });

  it('should not mount any iframe before the page is idle', () => {
    expect(component.previewsEnabled()).toBe(false);
    expect(component.shouldLoad(0)).toBe(false);
  });

  it('should only mount iframes for the active slide and its neighbours', () => {
    component.previewsEnabled.set(true);
    const active = 3;
    component.scrollTo(active);

    expect(component.shouldLoad(active - 1)).toBe(true);
    expect(component.shouldLoad(active)).toBe(true);
    expect(component.shouldLoad(active + 1)).toBe(true);
    expect(component.shouldLoad(active - 2)).toBe(false);
    expect(component.shouldLoad(active + 2)).toBe(false);
  });

  it('should expose every embedded app including the custom routed ones', () => {
    expect(component.apps.length).toBe(EMBEDDED_APPS.length);

    const routes = component.apps.map((app) => app.route);
    expect(routes).toContain('/flowdive');
    expect(routes).toContain('/wowquote2-manager');
    // Color has its own route component but must still be listed.
    expect(routes).toContain('/color');

    const titles = component.apps.map((app) => app.title);
    expect(titles).toContain('Beep Simulator');
    expect(titles).toContain('BTrain');
  });

  it('should preview the external app url, not the local route', () => {
    // Previewing '/slug' would re-bootstrap this very application inside each
    // tile, so previewUrl has to be the third party origin.
    component.apps.forEach((app, index) => {
      const preview = sanitizerValue(app.previewUrl);

      expect(preview).toBe(EMBEDDED_APPS[index].url);
      expect(preview.startsWith('http')).toBe(true);
      expect(preview).not.toBe(app.route);
    });
  });
});
