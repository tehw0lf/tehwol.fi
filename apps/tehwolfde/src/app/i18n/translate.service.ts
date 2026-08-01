import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';

export type Locale = 'en' | 'de';

/**
 * The locales on offer, in the order the switcher lists them.
 *
 * Endonyms rather than translated names: someone looking for their language
 * recognises it in its own spelling regardless of which locale is currently
 * active, so the menu stays usable even when the user cannot read the UI it is
 * rendered in. For the same reason these are not translation keys — they must
 * not change with the active locale.
 *
 * Adding a language means adding an entry here and an `assets/i18n/<code>.json`
 * file; the switcher picks it up without further changes.
 */
export const LOCALES: readonly { code: Locale; endonym: string }[] = [
  { code: 'en', endonym: 'English' },
  { code: 'de', endonym: 'Deutsch' }
] as const;

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private http = inject(HttpClient);

  locale = signal<Locale>('en');
  private translations = signal<Record<string, string>>({});

  readonly locales = LOCALES;

  constructor() {
    toObservable(this.locale)
      .pipe(switchMap((locale) => this.http.get<Record<string, string>>(`/assets/i18n/${locale}.json`).pipe(catchError(() => of({})))))
      .subscribe((t) => this.translations.set(t));
  }

  /**
   * The active locale's own name, shown on the switcher trigger. Both nav
   * variants render the same control, so the label lives here rather than being
   * duplicated in two templates.
   */
  currentEndonym = computed<string>(
    () =>
      LOCALES.find((l) => l.code === this.locale())?.endonym ?? this.locale()
  );

  translate(key: string): string {
    return this.translations()[key] ?? key;
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
  }
}
