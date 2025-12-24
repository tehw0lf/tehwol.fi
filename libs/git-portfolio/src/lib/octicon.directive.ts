import { Directive, ElementRef, input, OnInit, Renderer2, inject } from '@angular/core';
import octicons, { IconName } from '@primer/octicons';

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
    const el: HTMLElement = this.elementRef.nativeElement;
    if (this.octicon()) {
      const iconName = this.octicon() as IconName;
      if (octicons[iconName] !== undefined) {
        this.insertSvgSafely(el, octicons[iconName].toSVG());

        const icon: Node | null = el.firstChild;

        if (this.color() && icon) {
          this.renderer.setStyle(icon, 'fill', this.color());
        }
        if (this.width() && icon) {
          this.renderer.setStyle(icon, 'width', this.width());
          this.renderer.setStyle(icon, 'height', this.width());
        }
      } else {
        this.insertSvgSafely(el, octicons['alert'].toSVG());
        if (el.firstChild) {
          this.renderer.setStyle(el.firstChild, 'fill', 'red');
        }
      }
    }
  }

  private insertSvgSafely(element: HTMLElement, svgString: string): void {
    // Parse SVG string using DOMParser to avoid innerHTML XSS risk
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Clear existing content
    while (element.firstChild) {
      this.renderer.removeChild(element, element.firstChild);
    }

    // Append the safely parsed SVG element
    this.renderer.appendChild(element, svgElement);
  }
}
