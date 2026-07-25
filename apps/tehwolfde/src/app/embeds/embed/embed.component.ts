import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
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

  @ViewChild('iframe') private iframeRef:
    | ElementRef<HTMLIFrameElement>
    | undefined;

  private sanitizer = inject(DomSanitizer);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);

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
    toObservable(this.themeService.theme)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((theme) => this.sendMessage({ type: 'theme', theme }));
  }

  onIframeLoad(): void {
    this.sendMessage({ type: 'theme', theme: this.themeService.theme() });
  }

  sendMessage(data: Record<string, unknown>): void {
    const origin = this.targetOrigin();
    if (!origin) {
      return;
    }

    this.iframeRef?.nativeElement.contentWindow?.postMessage(data, origin);
  }
}
