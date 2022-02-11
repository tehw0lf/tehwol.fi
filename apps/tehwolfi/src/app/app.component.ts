import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'tehw0lf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tehwol.fi';

  constructor(private router: Router) {}
}
