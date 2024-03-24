import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { NavComponent } from './nav/nav.component';
import { ThemeService } from './theme.service';

@Component({
  selector: 'tehw0lf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NavComponent, NgClass]
})
export class AppComponent {
  constructor(public themeService: ThemeService) {}
}
