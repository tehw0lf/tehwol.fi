import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { EMBEDDED_APPS } from '../../embeds/apps';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { CarouselComponent } from '../carousel/carousel.component';
import {
  PreviewCard,
  PreviewCardComponent
} from './preview-card.component';

/** Library entry before its description key is resolved against the locale. */
interface LibraryEntry {
  title: string;
  descriptionKey: string;
  route: string;
}

const LIBRARIES: readonly LibraryEntry[] = [
  {
    title: 'git-portfolio',
    descriptionKey: 'home.gitPortfolioDescription',
    route: '/portfolio'
  },
  {
    title: 'wordlist-generator',
    descriptionKey: 'home.wordlistGeneratorDescription',
    route: '/wordlist-generator'
  },
  {
    title: 'contact-form',
    descriptionKey: 'home.contactFormDescription',
    route: '/contact-form'
  }
] as const;

@Component({
  selector: 'tehw0lf-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [TranslatePipe, CarouselComponent, PreviewCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private sanitizer = inject(DomSanitizer);
  translateService = inject(TranslateService);

  /**
   * Library previews are local routes, so they render this application inside
   * the iframe. Descriptions are resolved here rather than in the carousel,
   * which keeps that component free of i18n keys.
   */
  libraries = computed<readonly PreviewCard[]>(() =>
    LIBRARIES.map((library) => ({
      title: library.title,
      route: library.route,
      previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl(library.route),
      description: this.translateService.translate(library.descriptionKey)
    }))
  );

  /** Embedded apps have no description of their own, so the field stays unset. */
  apps: readonly PreviewCard[] = EMBEDDED_APPS.map((app) => ({
    title: app.title,
    route: `/${app.slug}`,
    previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl(app.url)
  }));
}
