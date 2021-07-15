import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tehw0lf-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  constructor() {
    //
  }
}
