import { Injectable, Renderer2, RendererFactory2, signal, WritableSignal, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private rendererFactory = inject(RendererFactory2);

  private renderer: Renderer2;
  theme: WritableSignal<string> = signal('dark');

  constructor() {
    const rendererFactory = this.rendererFactory;

    this.renderer = rendererFactory.createRenderer(null, null);
    this.renderer.addClass(document.body, 'dark');
  }

  dark(): void {
    this.theme.set('dark');
    this.renderer.removeClass(document.body, 'light');
    this.renderer.addClass(document.body, 'dark');
  }

  light(): void {
    this.theme.set('light');
    this.renderer.removeClass(document.body, 'dark');
    this.renderer.addClass(document.body, 'light');
  }
}
