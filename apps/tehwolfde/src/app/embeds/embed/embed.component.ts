import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  ViewChild
} from '@angular/core';
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
    ElementRef<HTMLIFrameElement> | undefined;

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
    // The theme subscription can fire before the first change detection, when
    // the required `url` input is not bound yet and reading it throws NG0950.
    // The `iframe` query is resolved only after the inputs are bound, so an
    // unresolved query means there is nothing to read and nothing to post to.
    // This relies on the query being non-static; the unit test for the unbound
    // case fails if that ordering ever changes.
    const target = this.iframeRef?.nativeElement.contentWindow;
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
