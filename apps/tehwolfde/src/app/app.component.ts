import { NgClass } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { NavComponent } from './components/nav/nav.component';
import { ThemeService } from './services/theme.service';
import { WebmcpService } from './services/webmcp.service';

@Component({
  selector: 'tehw0lf-root',
  templateUrl: './app.component.html',
  imports: [NavComponent, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  themeService = inject(ThemeService);
  private webmcp = inject(WebmcpService);

  constructor() {
    const router = inject(Router);
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        const main = document.getElementById('main-content');
        // preventScroll because focusing the main landmark is only meant to move
        // the reading position for keyboard and screen reader users. Without it
        // the browser scrolls every scrollable ancestor and descendant to reveal
        // the target, which walks the first carousel track on the page to its
        // far end — the libraries section arrived showing its last slide.
        main?.focus({ preventScroll: true });
      });

    // Exposes the site level tools to agents where the browser supports
    // WebMCP; a no-op everywhere else.
    afterNextRender(() => {
      void this.webmcp.register();
    });
  }
}
