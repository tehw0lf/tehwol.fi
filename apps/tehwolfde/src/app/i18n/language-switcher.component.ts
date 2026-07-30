import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { TranslatePipe } from './translate.pipe';
import { TranslateService } from './translate.service';

/** Counter behind the per instance id of the visually hidden description. */
let nextId = 0;

/**
 * Toggles between the two locales, showing the flag of the one being offered
 * rather than the one in use.
 *
 * The flags are inline SVG instead of regional indicator emoji: emoji need a
 * colour emoji font, which plain Linux installs frequently lack, and the glyph
 * degrades to tofu boxes rather than to the letter pair it falls back to on
 * Windows. The locale code sits next to the flag so the control still reads as
 * a language switch when the artwork is too small to identify.
 */
@Component({
  selector: 'tehw0lf-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  imports: [MatButtonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  translateService = inject(TranslateService);

  /**
   * Ties the button to its visually hidden description. Both nav variants are
   * in the DOM at once on every viewport, so a fixed id would be duplicated and
   * the second instance would point at the first one's description.
   */
  readonly describedById = `language-switcher-description-${nextId++}`;
}
