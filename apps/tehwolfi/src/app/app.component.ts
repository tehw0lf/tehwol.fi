import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ThemeService } from './theme.service';

@Component({
  selector: 'tehw0lf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLight = this.themeService.isLight;

  constructor(private router: Router, private themeService: ThemeService) {}
}
