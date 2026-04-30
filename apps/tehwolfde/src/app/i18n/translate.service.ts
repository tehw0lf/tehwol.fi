import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Locale = 'en' | 'de';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private http = inject(HttpClient);

  locale = signal<Locale>('en');
  private translations = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const locale = this.locale();
      this.http
        .get<Record<string, string>>(`/assets/i18n/${locale}.json`)
        .subscribe((t) => this.translations.set(t));
    });
  }

  translate(key: string): string {
    return this.translations()[key] ?? key;
  }

  toggle(): void {
    this.locale.update((l) => (l === 'en' ? 'de' : 'en'));
  }
}
