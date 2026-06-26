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

  private targetOrigin = computed(() => new URL(this.url()).origin);

  constructor() {
    toObservable(this.themeService.theme)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((theme) => {
        this.iframeRef?.nativeElement.contentWindow?.postMessage(
          { type: 'theme', theme },
          this.targetOrigin()
        );
      });
  }

  onIframeLoad(): void {
    this.iframeRef?.nativeElement.contentWindow?.postMessage(
      { type: 'theme', theme: this.themeService.theme() },
      this.targetOrigin()
    );
  }

  sendMessage(data: Record<string, unknown>): void {
    this.iframeRef?.nativeElement.contentWindow?.postMessage(
      data,
      this.targetOrigin()
    );
  }
}
