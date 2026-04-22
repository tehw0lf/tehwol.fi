import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

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
}
