import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DesktopComponent } from './desktop/desktop.component';
import { MobileComponent } from './mobile/mobile.component';

@Component({
  selector: 'tehw0lf-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
  imports: [DesktopComponent, MobileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent {}
