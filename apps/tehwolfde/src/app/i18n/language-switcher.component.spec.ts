import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageSwitcherComponent } from './language-switcher.component';
import { TranslateService } from './translate.service';

describe('LanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let translateService: TranslateService;
  let overlayContainer: OverlayContainer;

  /** The trigger element the user actually clicks. */
  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button.language-button');
  }

  function visibleName(): string {
    return (
      fixture.nativeElement
        .querySelector('.language-name')
        ?.textContent?.trim() ?? ''
    );
  }

  /** The menu renders into an overlay, outside the component's own DOM. */
  function menuItems(): HTMLButtonElement[] {
    return Array.from(
      overlayContainer
        .getContainerElement()
        .querySelectorAll('button[mat-menu-item]')
    );
  }

  /**
   * The endonym of each entry, read from its own span rather than from the
   * item's textContent: the tick is an icon font ligature, so its glyph name
   * would otherwise be counted as text even though aria-hidden keeps it away
   * from screen readers.
   */
  function menuEndonyms(): string[] {
    return menuItems().map(
      (i) => i.querySelector('span:not(.language-check)')?.textContent?.trim() ?? ''
    );
  }

  function openMenu(): void {
    trigger().click();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    translateService = TestBed.inject(TranslateService);
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  it('should show the active locale on the trigger', () => {
    // Menu convention: the trigger reports the current state rather than the
    // one a click would lead to, because the trigger only opens the menu.
    expect(translateService.locale()).toBe('en');
    expect(visibleName()).toBe('English');
  });

  it('should name each locale by its own endonym', () => {
    openMenu();

    // Endonyms, not translated names: they must stay recognisable to someone
    // who cannot read the currently active locale.
    expect(menuEndonyms()).toEqual(['English', 'Deutsch']);
  });

  it('should switch the locale when a menu entry is chosen', () => {
    openMenu();
    menuItems()[1].click();
    fixture.detectChanges();

    expect(translateService.locale()).toBe('de');
    expect(visibleName()).toBe('Deutsch');

    openMenu();
    menuItems()[0].click();
    fixture.detectChanges();

    expect(translateService.locale()).toBe('en');
    expect(visibleName()).toBe('English');
  });

  it('should offer every configured locale', () => {
    // Adding a language is meant to be a registry edit alone, so the menu is
    // driven by the list rather than by hardcoded entries.
    openMenu();

    expect(menuItems().length).toBe(translateService.locales.length);
  });

  it('should mark the active locale as checked', () => {
    openMenu();

    const checked = () =>
      menuItems().map((i) => i.getAttribute('aria-checked'));
    expect(checked()).toEqual(['true', 'false']);

    menuItems()[1].click();
    fixture.detectChanges();
    openMenu();

    expect(checked()).toEqual(['false', 'true']);
  });

  it('should expose the locale choice as an exclusive selection', () => {
    // menuitemradio is what conveys "one of these is active" to a screen
    // reader; plain menuitems would announce the tick as decoration only.
    openMenu();

    for (const item of menuItems()) {
      expect(item.getAttribute('role')).toBe('menuitemradio');
    }
  });

  it('should tag each entry with its own language', () => {
    // Without lang, a screen reader reads "Deutsch" with English phonetics.
    openMenu();

    expect(menuItems().map((i) => i.getAttribute('lang'))).toEqual([
      'en',
      'de'
    ]);
  });

  it('should report the menu expanded state on the trigger', () => {
    expect(trigger().getAttribute('aria-expanded')).toBe('false');

    openMenu();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('should keep the visible name inside the accessible name', () => {
    // WCAG 2.5.3: an aria-label that omits the visible text leaves voice
    // control users with no phrase that matches what they can see.
    expect(trigger().getAttribute('aria-label')).toBeNull();
    expect(visibleName().length).toBeGreaterThan(0);
  });

  it('should describe the control without overriding its name', () => {
    const describedBy = trigger().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const description = fixture.nativeElement.querySelector(
      `#${describedBy}`
    ) as HTMLElement | null;
    expect(description).toBeTruthy();
    expect(description?.textContent?.trim()).toBe('nav.switchLanguage');
  });

  it('should give each instance its own description id', () => {
    // Both nav variants render a switcher at once, so a fixed id would be
    // duplicated and the second trigger would point at the first description.
    const second = TestBed.createComponent(LanguageSwitcherComponent);
    second.detectChanges();

    const first = fixture.componentInstance.describedById;
    expect(second.componentInstance.describedById).not.toBe(first);
  });

  it('should mark the globe as decorative', () => {
    // The name beside it already names the language, so announcing the icon
    // would repeat it.
    const globe = fixture.nativeElement.querySelector('.language-globe');
    expect(globe.getAttribute('aria-hidden')).toBe('true');
  });
});
