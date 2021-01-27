import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import * as octicons from '@primer/octicons';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[octicon]'
})
export class OcticonDirective implements OnInit {
  @Input() octicon: string;
  @Input() color: string;
  @Input() width: number;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const el: HTMLElement = this.elementRef.nativeElement;
    el.innerHTML = octicons[this.octicon].toSVG();

    const icon: Node = el.firstChild;
    if (this.color) {
      this.renderer.setStyle(icon, 'fill', this.color);
    }
    if (this.width) {
      this.renderer.setStyle(icon, 'width', this.width);
      this.renderer.setStyle(icon, 'height', this.width);
    }
  }
}
