import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../i18n/translate.pipe';
import { ThemeService } from '../../services/theme.service';

interface AppCard {
  title: string;
  route: string;
  previewUrl: SafeResourceUrl;
}

@Component({
  selector: 'tehw0lf-app-carousel',
  templateUrl: './app-carousel.component.html',
  styleUrls: ['./app-carousel.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    NgStyle,
    TranslatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppCarouselComponent {
  private themeService = inject(ThemeService);
  private sanitizer = inject(DomSanitizer);

  private track = viewChild<ElementRef<HTMLElement>>('track');

  apps: AppCard[] = [
    'flowdive',
    'numveil',
    'beep',
    'btrain',
    'mutuals',
    'wowquote2-manager',
    'color',
    'farbduell'
  ].map((slug) => ({
    title: this.titleFor(slug),
    route: `/${slug}`,
    previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl(`/${slug}`)
  }));

  activeIndex = signal(0);

  canScrollBack = computed(() => this.activeIndex() > 0);
  canScrollForward = computed(() => this.activeIndex() < this.apps.length - 1);

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

  /**
   * Only the active slide and its immediate neighbours mount their iframe, so
   * scrolling stays cheap and idle embeds are never loaded.
   */
  shouldLoad(index: number): boolean {
    return Math.abs(index - this.activeIndex()) <= 1;
  }

  scrollBy(direction: -1 | 1): void {
    this.scrollTo(this.activeIndex() + direction);
  }

  scrollTo(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.apps.length - 1));
    this.activeIndex.set(clamped);

    const trackEl = this.track()?.nativeElement;
    const slide = trackEl?.children.item(clamped);
    // Guarded because jsdom and older engines do not implement scrollIntoView.
    slide?.scrollIntoView?.({ block: 'nearest', inline: 'start' });
  }

  /**
   * Keeps activeIndex in sync when the user scrolls or swipes the track
   * directly instead of using the arrow buttons.
   */
  onScroll(): void {
    const trackEl = this.track()?.nativeElement;
    if (!trackEl) {
      return;
    }

    const slideWidth = trackEl.scrollWidth / this.apps.length;
    const index = Math.round(trackEl.scrollLeft / slideWidth);
    this.activeIndex.set(Math.max(0, Math.min(index, this.apps.length - 1)));
  }

  private titleFor(slug: string): string {
    if (slug === 'wowquote2-manager') {
      return 'WoWQuote2 Manager';
    }
    if (slug === 'btrain') {
      return 'BTrain';
    }
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
}
