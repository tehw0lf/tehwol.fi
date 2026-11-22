import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'tehw0lf-embed',
  templateUrl: './embed.component.html',
  styleUrl: './embed.component.scss',
  standalone: true,
  imports: [MatIconButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmbedComponent {
  url = input.required<string>();
  title = input('Embedded Tool');

  private iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('iframe');
  private rendered = signal(false);

  private sanitizer = inject(DomSanitizer);
  private themeService = inject(ThemeService);

  safeUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.url())
  );

  private targetOrigin = computed(() => {
    try {
      return new URL(this.url()).origin;
    } catch {
      console.warn(
        `EmbedComponent: cannot derive an origin from "${this.url()}", theme messages are disabled`
      );
      return '';
    }
  });

  constructor() {
    afterNextRender(() => this.rendered.set(true));

    effect(() => {
      const theme = this.themeService.theme();
      // Only a theme change posts. `rendered` is read untracked: tracking it
      // would post once when it flips, to an iframe that has not loaded yet
      // (`onIframeLoad()` posts the initial theme).
      untracked(() => this.sendMessage({ type: 'theme', theme }));
    });
  }

  onIframeLoad(): void {
    this.sendMessage({ type: 'theme', theme: this.themeService.theme() });
  }

  sendMessage(data: Record<string, unknown>): void {
    // This method is public and may be called before the first render, when
    // the required `url` input is not bound yet and reading it throws NG0950.
    // `viewChild()` already resolves before the inputs are bound, so the query
    // alone cannot tell; the `rendered` signal can.
    if (!this.rendered()) {
      return;
    }

    const target = this.iframeRef()?.nativeElement.contentWindow;
    if (!target) {
      return;
    }

    const origin = this.targetOrigin();
    if (!origin) {
      return;
    }

    target.postMessage(data, origin);
  }
}
