import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private isLightSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  isLight: Observable<boolean>;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isLight = this.isLightSubject.asObservable();
  }

  dark(): void {
    this.isLightSubject.next(false);
    this.renderer.removeClass(document.body, 'light-theme');
  }

  light(): void {
    this.isLightSubject.next(true);
    this.renderer.addClass(document.body, 'light-theme');
  }
}
