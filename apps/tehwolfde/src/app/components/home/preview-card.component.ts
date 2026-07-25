import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../i18n/translate.pipe';
import { ThemeService } from '../../services/theme.service';

/** A home page slide: scaled down live preview, title and a link into the app. */
export interface PreviewCard {
  title: string;
  route: string;
  previewUrl: SafeResourceUrl;
  /**
   * Rendered below the preview when present. The libraries carry one, the
   * embedded apps do not, so callers pass it already translated rather than
   * having this component know about i18n keys.
   */
  description?: string;
}

@Component({
  selector: 'tehw0lf-preview-card',
  templateUrl: './preview-card.component.html',
  styleUrls: ['./preview-card.component.scss'],
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, NgStyle, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewCardComponent {
  private themeService = inject(ThemeService);

  readonly card = input.required<PreviewCard>();

  /** Position within the carousel, announced to screen readers as "3/8". */
  readonly index = input.required<number>();
  readonly total = input.required<number>();

  /**
   * Whether the preview iframe should be mounted. Driven by the carousel's
   * measured visibility, so off screen third party origins are never fetched.
   */
  readonly loadPreview = input(false);

  cardStyle = computed(() => ({
    'background-color':
      this.themeService.theme() === 'dark'
        ? 'rgba(34, 34, 34, 0.75)'
        : 'rgba(255, 255, 255, 0.75)',
    'backdrop-filter': 'blur(50px)',
    color: '#6699bb'
  }));

  buttonStyle = computed(() => ({
    'background-color':
      this.themeService.theme() === 'dark'
        ? '#333333'
        : 'rgba(255, 255, 255, 0.75)',
    color: '#e8903f'
  }));
}
