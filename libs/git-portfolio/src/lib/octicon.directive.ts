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
      if (octicons[this.octicon()! as IconName] !== undefined) {
        el.innerHTML = octicons[this.octicon()! as IconName].toSVG();

        const icon: Node | null = el.firstChild;

        if (this.color() && icon) {
          this.renderer.setStyle(icon, 'fill', this.color());
        }
        if (this.width() && icon) {
          this.renderer.setStyle(icon, 'width', this.width());
          this.renderer.setStyle(icon, 'height', this.width());
        }
      } else {
        el.innerHTML = octicons['alert'].toSVG();
        this.renderer.setStyle(el.firstChild, 'fill', 'red');
      }
    }
  }
}
