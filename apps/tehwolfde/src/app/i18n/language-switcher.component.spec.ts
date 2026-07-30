import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageSwitcherComponent } from './language-switcher.component';
import { TranslateService } from './translate.service';

describe('LanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let translateService: TranslateService;

  /** The button element the user actually clicks. */
  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  function visibleCode(): string {
    return (
      fixture.nativeElement
        .querySelector('.language-code')
        ?.textContent?.trim() ?? ''
    );
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should offer the locale the user is not reading', () => {
    // The control shows where a click leads, not where the user already is.
    // Inverting this would silently label every switcher wrongly.
    expect(translateService.locale()).toBe('en');
    expect(visibleCode()).toBe('de');
  });

  it('should toggle the locale when clicked', () => {
    button().click();
    fixture.detectChanges();

    expect(translateService.locale()).toBe('de');
    expect(visibleCode()).toBe('en');

    button().click();
    fixture.detectChanges();

    expect(translateService.locale()).toBe('en');
    expect(visibleCode()).toBe('de');
  });

  it('should show the flag of the offered locale', () => {
    const flagOf = () =>
      fixture.nativeElement.querySelector('svg.language-flag');

    expect(flagOf()).toBeTruthy();
    const offeringGerman = flagOf().outerHTML;

    button().click();
    fixture.detectChanges();

    // Different artwork per locale rather than one flag that never changes.
    expect(flagOf().outerHTML).not.toBe(offeringGerman);
  });

  it('should keep the visible code inside the accessible name', () => {
    // WCAG 2.5.3: an aria-label that omits the visible text leaves voice
    // control users with no phrase that matches what they can see.
    expect(button().getAttribute('aria-label')).toBeNull();
    expect(visibleCode().length).toBeGreaterThan(0);
  });

  it('should describe the control without overriding its name', () => {
    const describedBy = button().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const description = fixture.nativeElement.querySelector(
      `#${describedBy}`
    ) as HTMLElement | null;
    expect(description).toBeTruthy();
    expect(description?.textContent?.trim()).toBe('nav.switchLanguage');
  });

  it('should give each instance its own description id', () => {
    // Both nav variants render a switcher at once, so a fixed id would be
    // duplicated and the second button would point at the first description.
    const second = TestBed.createComponent(LanguageSwitcherComponent);
    second.detectChanges();

    const first = fixture.componentInstance.describedById;
    expect(second.componentInstance.describedById).not.toBe(first);
  });

  it('should mark the flag as decorative', () => {
    // The code beside it already names the language, so announcing the artwork
    // would repeat it.
    const flag = fixture.nativeElement.querySelector('svg.language-flag');
    expect(flag.getAttribute('aria-hidden')).toBe('true');
  });
});
