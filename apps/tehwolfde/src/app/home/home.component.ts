import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tehw0lf-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}
