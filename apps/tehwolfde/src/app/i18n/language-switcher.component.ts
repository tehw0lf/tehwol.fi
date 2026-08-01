import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { TranslatePipe } from './translate.pipe';
import { Locale, TranslateService } from './translate.service';

/** Counter behind the per instance id of the visually hidden description. */
let nextId = 0;

/**
 * Opens a menu of the available locales, each named by its own endonym.
 *
 * A globe rather than flags: a flag names a country, not a language, so the
 * artwork is wrong wherever the two do not line up (English is not the United
 * States) and becomes a political choice as soon as a language is spoken in
 * several countries. The globe carries no such claim and needs no per locale
 * artwork when a language is added.
 *
 * The trigger shows the active locale, following the usual menu convention that
 * the trigger reports the current state and the choices live inside.
 */
@Component({
  selector: 'tehw0lf-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  imports: [MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  translateService = inject(TranslateService);

  readonly locales = this.translateService.locales;

  /**
   * Ties the trigger to its visually hidden description. Both nav variants are
   * in the DOM at once on every viewport, so a fixed id would be duplicated and
   * the second instance would point at the first one's description.
   */
  readonly describedById = `language-switcher-description-${nextId++}`;

  select(locale: Locale): void {
    this.translateService.setLocale(locale);
  }
}
