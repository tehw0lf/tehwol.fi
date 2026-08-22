import { NgStyle } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '../../i18n/translate.pipe';
import { ThemeService } from '../../services/theme.service';

/**
 * Horizontally scrolling container that owns the track, the arrow buttons and
 * the visibility measurement, but nothing about what a slide contains.
 *
 * Slides are projected, so any content can be carouselled: preview cards on the
 * home page, repository cards elsewhere. Callers that need lazy loading read
 * `shouldLoad(i)` off the exported instance:
 *
 * ```html
 * <tehw0lf-carousel #carousel section="apps" [label]="'Apps'" [itemCount]="8">
 *   @for (app of apps; track app.route; let i = $index) {
 *     <div class="carousel-slide">
 *       @defer (when carousel.shouldLoad(i)) { <iframe … /> }
 *     </div>
 *   }
 * </tehw0lf-carousel>
 * ```
 *
 * Projected slides must carry the `carousel-slide` class so the track can lay
 * them out and measure them.
 */
@Component({
  selector: 'tehw0lf-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  standalone: true,
  exportAs: 'carousel',
  imports: [MatButtonModule, MatIconModule, NgStyle, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent {
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);

  private track = viewChild<ElementRef<HTMLElement>>('track');

  /** Heading above the track, already translated by the caller. */
  readonly label = input.required<string>();

  /**
   * Number of projected slides. Passed in rather than counted from the DOM: the
   * scroll clamping and the button state are derived from it, and querying
   * projected children would tie those to change detection timing.
   */
  readonly itemCount = input.required<number>();

  /**
   * Locale independent identifier for this section, emitted as a data
   * attribute. Lets tests and styles target one carousel without depending on
   * the translated label or on the order the sections happen to render in.
   */
  readonly section = input.required<string>();

  activeIndex = signal(0);

  /**
   * Previews point at third party origins, so they must not compete with the
   * initial page load. Mounting is deferred until the browser reports idle.
   */
  readonly previewsEnabled = signal(false);

  /**
   * Index of the last slide that is at least partly visible.
   *
   * Several slides fit on screen at once on wide viewports, so the active index
   * alone describes neither how far the track can still scroll nor which
   * previews the user can actually see. Updated from measurements on scroll and
   * resize; the initial value covers the first paint before any event fires.
   */
  private lastVisibleIndex = signal(0);

  canScrollBack = computed(() => this.activeIndex() > 0);

  /**
   * Derived from the last visible slide rather than the active one: with six of
   * eight slides on screen the active index stops well short of the final slide,
   * which would otherwise leave the forward button enabled at the right edge.
   */
  canScrollForward = computed(
    () => this.lastVisibleIndex() < this.itemCount() - 1
  );

  /**
   * Whether the track can scroll at all. False hides the arrows entirely, so a
   * section whose slides all fit at once (the three libraries on a wide
   * viewport) shows no permanently disabled controls.
   */
  canScroll = computed(() => this.canScrollBack() || this.canScrollForward());

  constructor() {
    afterNextRender(() => {
      this.measureVisibleRange();

      // The number of slides on screen changes with the viewport, so both the
      // button state and the preview window have to be re-measured on resize.
      const onResize = () => this.measureVisibleRange();
      window.addEventListener('resize', onResize, { passive: true });
      this.destroyRef.onDestroy(() =>
        window.removeEventListener('resize', onResize)
      );
    });

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

  buttonStyle = computed(() => ({
    'background-color':
      this.themeService.theme() === 'dark'
        ? 'var(--tw-control-bg, #333333)'
        : 'rgba(255, 255, 255, 0.75)',
    color: 'var(--tw-link, #e8903f)'
  }));

  /**
   * Mounts the iframes of every visible slide plus one on each side, so the
   * next slide is ready before it scrolls in while off screen embeds stay
   * unloaded.
   *
   * A fixed window around the active index cannot work here: it would leave
   * most of the visible slides blank whenever the viewport fits more than three
   * of them.
   */
  shouldLoad(index: number): boolean {
    return (
      this.previewsEnabled() &&
      index >= this.activeIndex() - 1 &&
      index <= this.lastVisibleIndex() + 1
    );
  }

  /**
   * Records which slides intersect the track viewport.
   *
   * @param scrollLeft Position to measure against, for callers that know where
   * an in progress smooth scroll is heading. Defaults to the current offset.
   *
   * Counts only slides that fit entirely between both viewport edges, so a
   * clipped one never reports the range as reaching further than it does.
   *
   * Falls back to the active slide alone when the track has not been laid out,
   * which is the case in jsdom where every element reports a zero size, and
   * likewise when the viewport is too narrow to fit any slide in full.
   */
  private measureVisibleRange(scrollLeft?: number): void {
    const trackEl = this.track()?.nativeElement;
    if (!trackEl || !trackEl.clientWidth) {
      this.lastVisibleIndex.set(this.activeIndex());
      return;
    }

    const slides = Array.from(trackEl.children) as HTMLElement[];
    const viewportStart = scrollLeft ?? trackEl.scrollLeft;
    const viewportEnd = viewportStart + trackEl.clientWidth;

    // Seeded below the first slide rather than from the active index: a clipped
    // active slide would otherwise count itself as visible and disable the
    // forward button while it still sits half off screen.
    let last = -1;
    slides.forEach((slide, index) => {
      const start = slide.offsetLeft - trackEl.offsetLeft;
      // Fully visible, not merely peeking in, so a slide clipped by either edge
      // stays scrollable to.
      if (
        start >= viewportStart - 1 &&
        start + slide.offsetWidth <= viewportEnd + 1
      ) {
        last = index;
      }
    });

    // A viewport narrower than a single slide fits none of them fully. Falling
    // back to the active slide keeps the range non empty, so the arrows still
    // describe a track that can be scrolled one slide at a time.
    this.lastVisibleIndex.set(last === -1 ? this.activeIndex() : last);
  }

  scrollBy(direction: -1 | 1): void {
    this.scrollTo(this.activeIndex() + direction);
  }

  scrollTo(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.itemCount() - 1));

    const trackEl = this.track()?.nativeElement;
    if (!trackEl) {
      this.activeIndex.set(clamped);
      this.measureVisibleRange();
      return;
    }

    const slide = trackEl.children.item(clamped) as HTMLElement | null;
    // Guarded because jsdom and older engines do not implement scrollIntoView.
    slide?.scrollIntoView?.({ block: 'nearest', inline: 'start' });

    // The browser stops at the end of the track, so the last slides all settle
    // at the same offset. Recording the requested index there would leave
    // activeIndex on a slide the track never reached, and the next step back
    // would move by the difference rather than by a full slide.
    const target = slide ? slide.offsetLeft - trackEl.offsetLeft : undefined;
    const maxScroll = Math.max(0, trackEl.scrollWidth - trackEl.clientWidth);
    const reached =
      target === undefined ? target : Math.min(target, maxScroll);

    this.activeIndex.set(
      reached === undefined || reached === target
        ? clamped
        : this.indexAtOffset(trackEl, reached)
    );

    // Smooth scrolling settles asynchronously, so scrollLeft still holds the old
    // value here. Measuring from where the slide is heading mounts the previews
    // it brings into view immediately rather than one scroll event later.
    this.measureVisibleRange(reached);
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

    if (!trackEl.children.length) {
      return;
    }

    this.activeIndex.set(this.indexAtOffset(trackEl, trackEl.scrollLeft));
    this.measureVisibleRange();
  }

  /**
   * The slide sitting closest to a scroll offset.
   *
   * Measured from the real slide offsets rather than derived from scrollWidth,
   * so the flex gap cannot skew the result.
   */
  private indexAtOffset(trackEl: HTMLElement, scrollLeft: number): number {
    const slides = Array.from(trackEl.children) as HTMLElement[];

    let closest = 0;
    let smallestDelta = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const delta = Math.abs(slide.offsetLeft - trackEl.offsetLeft - scrollLeft);
      if (delta < smallestDelta) {
        smallestDelta = delta;
        closest = index;
      }
    });

    return closest;
  }
}
