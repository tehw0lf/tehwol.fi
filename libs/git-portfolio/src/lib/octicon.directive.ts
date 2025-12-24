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
        const icon = this.insertSvgSafely(el, octicons[iconName].toSVG());

        if (this.color() && icon) {
          this.renderer.setStyle(icon, 'fill', this.color());
        }
        if (this.width() && icon) {
          this.renderer.setStyle(icon, 'width', this.width());
          this.renderer.setStyle(icon, 'height', this.width());
        }
      } else {
        const alertIcon = this.insertSvgSafely(el, octicons['alert'].toSVG());
        if (alertIcon) {
          this.renderer.setStyle(alertIcon, 'fill', 'red');
        }
      }
    }
  }

  private insertSvgSafely(element: HTMLElement, svgString: string): Node | null {
    // Use document.createRange().createContextualFragment() which works better
    // in both browser and JSDOM environments compared to DOMParser
    const range = document.createRange();
    range.selectNode(element);
    const fragment = range.createContextualFragment(svgString);

    // Clear existing content
    while (element.firstChild) {
      this.renderer.removeChild(element, element.firstChild);
    }

    // Append the safely parsed SVG element
    const svgElement = fragment.firstChild;
    if (svgElement) {
      this.renderer.appendChild(element, svgElement);
    }

    // Return the inserted SVG element
    return svgElement;
  }
}
