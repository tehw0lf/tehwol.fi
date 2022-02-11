import { FocusMonitor } from '@angular/cdk/a11y';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { ThemeService } from '../../theme.service';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'tehw0lf-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss']
})
export class DesktopComponent implements AfterViewInit, OnInit {
  isLight: Observable<boolean> = of(false);

  constructor(
    private focusMonitor: FocusMonitor,
    private router: Router,
    private sidenavService: SidenavService,
    private themeService: ThemeService
  ) {}

  ngAfterViewInit(): void {
    const menu = document.getElementById('menu');
    if (menu) {
      this.focusMonitor.stopMonitoring(menu);
    }
  }

  ngOnInit(): void {
    this.isLight = this.themeService.isLight;
  }

  isActive(): boolean {
    return (
      this.router.isActive('/', true) || this.router.isActive('/home', true)
    );
  }

  toggleSidenav(): void {
    this.sidenavService.toggle();
  }

  switchToLight(): void {
    this.themeService.light();
  }

  switchToDark(): void {
    this.themeService.dark();
  }
}
