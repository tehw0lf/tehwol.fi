import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';

import { NavComponent } from './nav/nav.component';
import { ThemeService } from './theme.service';

@Component({
    selector: 'tehw0lf-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [NavComponent, NgClass]
})
export class AppComponent {
  themeService = inject(ThemeService);
}
