import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';

export type Locale = 'en' | 'de';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private http = inject(HttpClient);

  locale = signal<Locale>('en');
  private translations = signal<Record<string, string>>({});

  constructor() {
    toObservable(this.locale)
      .pipe(switchMap((locale) => this.http.get<Record<string, string>>(`/assets/i18n/${locale}.json`).pipe(catchError(() => of({})))))
      .subscribe((t) => this.translations.set(t));
  }

  /**
   * The locale the switcher offers, which is the one the user is not currently
   * reading. Both nav variants render the same control, so the label lives here
   * rather than being duplicated as a ternary in two templates.
   */
  nextLocale = computed<Locale>(() => (this.locale() === 'en' ? 'de' : 'en'));

  translate(key: string): string {
    return this.translations()[key] ?? key;
  }

  toggle(): void {
    this.locale.update((l) => (l === 'en' ? 'de' : 'en'));
  }
}
