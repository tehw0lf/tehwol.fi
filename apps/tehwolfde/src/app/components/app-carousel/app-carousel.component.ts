import { NgStyle } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
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

import { EMBEDDED_APPS } from '../../embeds/apps';
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
  private destroyRef = inject(DestroyRef);

  private track = viewChild<ElementRef<HTMLElement>>('track');

  apps: AppCard[] = EMBEDDED_APPS.map((app) => ({
    title: app.title,
    route: `/${app.slug}`,
    previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl(app.url)
  }));

  activeIndex = signal(0);

  /**
   * Previews point at third party origins, so they must not compete with the
   * initial page load. Mounting is deferred until the browser reports idle.
   */
  readonly previewsEnabled = signal(false);

  canScrollBack = computed(() => this.activeIndex() > 0);
  canScrollForward = computed(() => this.activeIndex() < this.apps.length - 1);

  constructor() {
    afterNextRender(() => {
      const enable = () => this.previewsEnabled.set(true);

      // Backgrounded tabs can defer idle callbacks indefinitely, so a plain
      // timeout always runs as a fallback. Both are cancelled on destroy.
      const idleHandle =
        'requestIdleCallback' in window
          ? window.requestIdleCallback(enable, { timeout: 3000 })
          : undefined;
      const timeoutHandle = setTimeout(enable, 3000);

      this.destroyRef.onDestroy(() => {
        if (idleHandle !== undefined) {
          window.cancelIdleCallback(idleHandle);
        }
        clearTimeout(timeoutHandle);
      });
    });
  }

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
    return (
      this.previewsEnabled() && Math.abs(index - this.activeIndex()) <= 1
    );
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

    // Measured from the real slide offsets rather than derived from
    // scrollWidth, so the flex gap cannot skew the result.
    const slides = Array.from(trackEl.children) as HTMLElement[];
    if (!slides.length) {
      return;
    }

    const scrollLeft = trackEl.scrollLeft;
    let closest = 0;
    let smallestDelta = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const delta = Math.abs(slide.offsetLeft - trackEl.offsetLeft - scrollLeft);
      if (delta < smallestDelta) {
        smallestDelta = delta;
        closest = index;
      }
    });

    this.activeIndex.set(closest);
  }
}
