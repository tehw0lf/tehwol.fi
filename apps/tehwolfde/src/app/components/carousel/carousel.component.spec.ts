import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselComponent } from './carousel.component';

const SLIDE_WIDTH = 320;
const SLIDE_GAP = 24;

/**
 * Drives the carousel the way the real callers do: slides are projected, and
 * the lazy loading flag is read back off the exported instance. Recording
 * shouldLoad per slide is what proves that contract works through projection.
 */
@Component({
  standalone: true,
  imports: [CarouselComponent],
  template: `
    <tehw0lf-carousel
      #carousel="carousel"
      section="test"
      label="Test"
      [itemCount]="count()"
    >
      @for (item of items(); track item; let i = $index) {
        <div class="carousel-slide">
          <span class="loaded">{{ carousel.shouldLoad(i) }}</span>
        </div>
      }
    </tehw0lf-carousel>
  `
})
class HostComponent {
  count = signal(8);
  items = signal<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);
  carousel = viewChild.required(CarouselComponent);

  setSlideCount(count: number): void {
    this.count.set(count);
    this.items.set(Array.from({ length: count }, (_, index) => index));
  }
}

/**
 * jsdom reports every element as zero sized, so the component would only ever
 * exercise its unmeasurable fallback. This lays the track out as the browser
 * would: fixed width slides in a row, inside a viewport showing `visibleSlides`
 * of them.
 */
function layOutTrack(
  fixture: ComponentFixture<HostComponent>,
  visibleSlides: number
): HTMLElement {
  const track: HTMLElement =
    fixture.nativeElement.querySelector('.carousel-track');

  Object.defineProperty(track, 'clientWidth', {
    configurable: true,
    get: () => visibleSlides * (SLIDE_WIDTH + SLIDE_GAP) - SLIDE_GAP
  });
  Object.defineProperty(track, 'offsetLeft', { configurable: true, value: 0 });

  Array.from(track.children).forEach((slide, index) => {
    Object.defineProperty(slide, 'offsetLeft', {
      configurable: true,
      value: index * (SLIDE_WIDTH + SLIDE_GAP)
    });
    // Visibility is measured against the slide's right edge, so the width has
    // to be laid out too or every slide would measure as zero wide.
    Object.defineProperty(slide, 'offsetWidth', {
      configurable: true,
      value: SLIDE_WIDTH
    });
  });

  return track;
}

describe('CarouselComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: CarouselComponent;

  /** Moves the track as a real scroll would and notifies the component. */
  function scrollTrackTo(track: HTMLElement, scrollLeft: number): void {
    Object.defineProperty(track, 'scrollLeft', {
      configurable: true,
      value: scrollLeft
    });
    component.onScroll();
    fixture.detectChanges();
  }

  /** shouldLoad as seen by the projected slides, not by calling it directly. */
  function loadedFlags(): boolean[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.loaded')).map(
      (node) => (node as HTMLElement).textContent?.trim() === 'true'
    );
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = host.carousel();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should project the slides into its track', () => {
    const slides = fixture.nativeElement.querySelectorAll(
      '.carousel-track > .carousel-slide'
    );

    expect(slides.length).toBe(8);
  });

  it('should start on the first slide with back disabled', () => {
    expect(component.activeIndex()).toBe(0);
    expect(component.canScrollBack()).toBe(false);
    expect(component.canScrollForward()).toBe(true);
  });

  it('should advance and go back', () => {
    component.scrollBy(1);
    expect(component.activeIndex()).toBe(1);
    expect(component.canScrollBack()).toBe(true);

    component.scrollBy(-1);
    expect(component.activeIndex()).toBe(0);
  });

  it('should clamp at both ends', () => {
    component.scrollBy(-1);
    expect(component.activeIndex()).toBe(0);

    component.scrollTo(99);
    expect(component.activeIndex()).toBe(7);
    expect(component.canScrollForward()).toBe(false);
  });

  it('should disable forward once the last slide is visible, not only when it is active', () => {
    // Six of eight slides on screen: the active index can never reach the last
    // one, so deriving the button state from it would leave it enabled forever.
    const track = layOutTrack(fixture, 6);
    const maxScroll = 2 * (SLIDE_WIDTH + SLIDE_GAP);

    scrollTrackTo(track, 0);
    expect(component.canScrollForward()).toBe(true);

    scrollTrackTo(track, maxScroll);
    expect(component.activeIndex()).toBe(2);
    expect(component.activeIndex()).toBeLessThan(7);
    expect(component.canScrollForward()).toBe(false);
    expect(component.canScrollBack()).toBe(true);
  });

  it('should keep forward enabled while the last slide is only partly on screen', () => {
    // Half a slide wider than six full ones, so slide 6 peeks in at the right
    // edge without ever being reachable. Counting that sliver as visible left
    // the last card clipped with the forward arrow already greyed out.
    const track: HTMLElement =
      fixture.nativeElement.querySelector('.carousel-track');
    Object.defineProperty(track, 'clientWidth', {
      configurable: true,
      get: () => 6 * (SLIDE_WIDTH + SLIDE_GAP) - SLIDE_GAP + SLIDE_WIDTH / 2
    });
    Object.defineProperty(track, 'offsetLeft', {
      configurable: true,
      value: 0
    });
    Array.from(track.children).forEach((slide, index) => {
      Object.defineProperty(slide, 'offsetLeft', {
        configurable: true,
        value: index * (SLIDE_WIDTH + SLIDE_GAP)
      });
      Object.defineProperty(slide, 'offsetWidth', {
        configurable: true,
        value: SLIDE_WIDTH
      });
    });

    scrollTrackTo(track, 0);

    expect(component.canScrollForward()).toBe(true);
  });

  it('should not count a clipped active slide as the last visible one', () => {
    // A viewport one and a half slides wide, scrolled so the active slide is cut
    // off by the right edge. Seeding the measurement from the active index made
    // that slide count itself as fully visible, which reported the visible range
    // one slide further than it really reached.
    const track: HTMLElement =
      fixture.nativeElement.querySelector('.carousel-track');
    Object.defineProperty(track, 'clientWidth', {
      configurable: true,
      get: () => SLIDE_WIDTH + SLIDE_WIDTH / 2
    });
    Object.defineProperty(track, 'offsetLeft', {
      configurable: true,
      value: 0
    });
    Array.from(track.children).forEach((slide, index) => {
      Object.defineProperty(slide, 'offsetLeft', {
        configurable: true,
        value: index * (SLIDE_WIDTH + SLIDE_GAP)
      });
      Object.defineProperty(slide, 'offsetWidth', {
        configurable: true,
        value: SLIDE_WIDTH
      });
    });

    // Just short of slide 3's own offset, so it is the nearest one and becomes
    // active, while still extending past the viewport's right edge.
    const clippedOffset = 3 * (SLIDE_WIDTH + SLIDE_GAP) - SLIDE_WIDTH / 4;
    scrollTrackTo(track, clippedOffset);

    expect(component.activeIndex()).toBe(3);
    // Slide 3 is clipped, so the fully visible range ends before it and the
    // forward control still has somewhere to go.
    expect(component.canScrollForward()).toBe(true);
    // The clipped slide is still mounted as the one after the visible range,
    // but the range itself must not claim to reach it.
    expect(loadedFlags()[4]).toBe(false);
  });

  it('should report every visible slide as loadable through the projected content', () => {
    // The bug this covers showed two loaded previews next to four blank tiles.
    const track = layOutTrack(fixture, 6);
    component.previewsEnabled.set(true);
    scrollTrackTo(track, 0);

    // Six visible plus one prefetched ahead; the last stays unloaded.
    expect(loadedFlags()).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false
    ]);
  });

  it('should not mount any iframe before the page is idle', () => {
    expect(component.previewsEnabled()).toBe(false);
    expect(loadedFlags().some((flag) => flag)).toBe(false);
  });

  it('should not mount iframes for slides far outside the viewport', () => {
    // Narrow viewport: one slide visible, so the window is the active slide and
    // one neighbour on each side.
    const track = layOutTrack(fixture, 1);
    component.previewsEnabled.set(true);
    scrollTrackTo(track, 3 * (SLIDE_WIDTH + SLIDE_GAP));

    expect(component.activeIndex()).toBe(3);
    expect(loadedFlags()).toEqual([
      false,
      false,
      true,
      true,
      true,
      false,
      false,
      false
    ]);
  });

  it('should hide the arrows when every slide fits at once', () => {
    // Three libraries on a wide viewport: permanently disabled arrows would be
    // controls that can never do anything.
    host.setSlideCount(3);
    fixture.detectChanges();

    const track = layOutTrack(fixture, 3);
    scrollTrackTo(track, 0);

    expect(component.canScroll()).toBe(false);
    expect(
      fixture.nativeElement.querySelector('.carousel-controls')
    ).toBeNull();
  });

  it('should show the arrows when the slides overflow', () => {
    const track = layOutTrack(fixture, 3);
    scrollTrackTo(track, 0);

    expect(component.canScroll()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('.carousel-controls')
    ).not.toBeNull();
  });

  it('should render the label as the heading and expose the section', () => {
    expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe(
      'Test'
    );
    expect(
      fixture.nativeElement.querySelector('[data-section="test"]')
    ).not.toBeNull();
  });
});
