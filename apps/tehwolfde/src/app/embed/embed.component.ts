import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ThemeService } from '../theme.service';

@Component({
  selector: 'tehw0lf-embed',
  templateUrl: './embed.component.html',
  styleUrl: './embed.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmbedComponent {
  url = input.required<string>();

  @ViewChild('iframe') private iframeRef: ElementRef<HTMLIFrameElement> | undefined;

  private sanitizer = inject(DomSanitizer);
  private themeService = inject(ThemeService);

  safeUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.url())
  );

  constructor() {
    effect(() => {
      const theme = this.themeService.theme();
      this.iframeRef?.nativeElement.contentWindow?.postMessage(
        { type: 'theme', theme },
        '*'
      );
    });
  }

  onIframeLoad(): void {
    this.iframeRef?.nativeElement.contentWindow?.postMessage(
      { type: 'theme', theme: this.themeService.theme() },
      '*'
    );
  }

  sendMessage(data: Record<string, unknown>): void {
    this.iframeRef?.nativeElement.contentWindow?.postMessage(data, '*');
  }
}
