import { Component } from '@angular/core';
import { MobileComponent } from './mobile/mobile.component';
import { DesktopComponent } from './desktop/desktop.component';

@Component({
  selector: 'tehw0lf-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: true,
  imports: [DesktopComponent, MobileComponent]
})
export class NavComponent {
  constructor() {
    //
  }
}
