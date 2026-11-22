import {
  Directive,
  ElementRef,
  input,
  OnInit,
  Renderer2,
  inject
} from '@angular/core';

// A navigation cancels pending fetches. Firefox rejects them after
// `beforeunload` and before `pagehide`, so the page counts as leaving from
// `beforeunload` until `pageshow` (a page restored from the back/forward
// cache is live again).
let leaving = false;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    leaving = true;
  });
  window.addEventListener('pageshow', () => {
    leaving = false;
  });
}

function isCancelledByNavigation(err: unknown): boolean {
  // The directive never aborts a fetch itself, so an AbortError comes from
  // outside. A fetch TypeError (network error) looks the same for a
  // navigation and a real failure, so it is told apart by the page state.
  if ((err as { name?: string } | null)?.name === 'AbortError') return true;
  return err instanceof TypeError && leaving;
}

const svgCache = new Map<string, Promise<string>>();

const KNOWN_ICONS = new Set([
  'check',
  'issue-opened',
  'paste',
  'repo-forked',
  'star',
  'alert'
]);

function fetchSvg(name: string): Promise<string> {
  const icon = KNOWN_ICONS.has(name) ? name : 'alert';
  if (!svgCache.has(icon)) {
    const promise = fetch(`/assets/icons/octicons/${icon}.svg`).then((r) => {
      if (!r.ok)
        throw new Error(`Failed to load octicon "${icon}": ${r.status}`);
      return r.text();
    });
    promise.catch(() => svgCache.delete(icon));
    svgCache.set(icon, promise);
  }
  return svgCache.get(icon)!;
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[octicon]',
  standalone: true
})
export class OcticonDirective implements OnInit {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  octicon = input.required<string>();
  color = input.required<string>();
  width = input<string>();

  ngOnInit(): void {
    fetchSvg(this.octicon())
      .then((svgText) => {
        const el: HTMLElement = this.elementRef.nativeElement;
        const icon = this.insertSvgSafely(el, svgText);
        if (this.color() && icon) {
          this.renderer.setStyle(icon, 'fill', this.color());
        }
        if (this.width() && icon) {
          this.renderer.setStyle(icon, 'width', this.width());
          this.renderer.setStyle(icon, 'height', this.width());
        }
      })
      .catch((err) => {
        if (isCancelledByNavigation(err)) return;
        console.error(err);
      });
  }

  private insertSvgSafely(
    element: HTMLElement,
    svgString: string
  ): Element | null {
    const range = document.createRange();
    range.selectNode(element);
    const fragment = range.createContextualFragment(svgString);
    while (element.firstChild) {
      this.renderer.removeChild(element, element.firstChild);
    }
    const svgElement = fragment.querySelector('svg');
    if (svgElement) {
      this.renderer.appendChild(element, svgElement);
    }
    return svgElement;
  }
}
