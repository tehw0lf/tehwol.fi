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
        main?.focus();
      });

    // Exposes the site level tools to agents where the browser supports
    // WebMCP; a no-op everywhere else.
    afterNextRender(() => {
      void this.webmcp.register();
    });
  }
}
