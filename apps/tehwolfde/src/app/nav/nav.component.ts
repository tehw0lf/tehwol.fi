import { Component } from '@angular/core';

import { DesktopComponent } from './desktop/desktop.component';
import { MobileComponent } from './mobile/mobile.component';

@Component({
  selector: 'tehw0lf-nav',
  templateUrl: './nav.component.html',
  imports: [DesktopComponent, MobileComponent]
})
export class NavComponent {}
