import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ComponentFixture,
  DeferBlockBehavior,
  TestBed
} from '@angular/core/testing';
import { SafeResourceUrl } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { EMBEDDED_APPS } from '../../embeds/apps';
import { HomeComponent } from './home.component';

/** Unwraps the string a bypassSecurityTrustResourceUrl value was built from. */
function sanitizerValue(url: SafeResourceUrl): string {
  return String(
    (url as { changingThisBreaksApplicationSecurity?: string })
      .changingThisBreaksApplicationSecurity
  );
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ],
      deferBlockBehavior: DeferBlockBehavior.Manual
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a carousel for the libraries and one for the apps', () => {
    const headings = Array.from(
      fixture.nativeElement.querySelectorAll('h2')
    ).map((heading) => (heading as HTMLElement).textContent?.trim());

    // Both sections are labelled; the apps section used to be the only one.
    expect(headings).toEqual(['home.libraries', 'home.apps']);
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

  it('should give the libraries a description but the apps none', () => {
    // The description field is optional precisely because the apps have none.
    component.libraries().forEach((library) => {
      expect(library.description).toBeTruthy();
    });

    component.apps.forEach((app) => {
      expect(app.description).toBeUndefined();
    });
  });

  it('should preview libraries from their own local route', () => {
    component.libraries().forEach((library) => {
      expect(sanitizerValue(library.previewUrl)).toBe(library.route);
    });
  });
});
