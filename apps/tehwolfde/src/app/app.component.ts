import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { NavComponent } from './components/nav/nav.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'tehw0lf-root',
  templateUrl: './app.component.html',
  imports: [NavComponent, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  themeService = inject(ThemeService);

  constructor() {
    const router = inject(Router);
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const main = document.getElementById('main-content');
        main?.focus();
      });
  }
}
