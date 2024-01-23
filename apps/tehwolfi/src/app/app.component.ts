import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ThemeService } from './theme.service';
import { NgClass, AsyncPipe } from '@angular/common';
import { NavComponent } from './nav/nav.component';

@Component({
    selector: 'tehw0lf-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [NavComponent, NgClass, AsyncPipe]
})
export class AppComponent {
  isLight = this.themeService.isLight;

  constructor(private router: Router, private themeService: ThemeService) {}
}
