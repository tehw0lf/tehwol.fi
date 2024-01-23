import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const octicons = require('@primer/octicons');

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[octicon]',
  standalone: true
})
export class OcticonDirective implements OnInit {
  @Input() octicon: string | undefined;
  @Input() color: string | undefined;
  @Input() width: string | undefined;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const el: HTMLElement = this.elementRef.nativeElement;
    if (this.octicon) {
      if (octicons[this.octicon] !== undefined) {
        el.innerHTML = octicons[this.octicon].toSVG();

        const icon: Node | null = el.firstChild;

        if (this.color && icon) {
          this.renderer.setStyle(icon, 'fill', this.color);
        }
        if (this.width && icon) {
          this.renderer.setStyle(icon, 'width', this.width);
          this.renderer.setStyle(icon, 'height', this.width);
        }
      } else {
        el.innerHTML = octicons['alert'].toSVG();
        this.renderer.setStyle(el.firstChild, 'fill', 'red');
      }
    }
  }
}
