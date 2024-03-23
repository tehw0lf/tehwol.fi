import { FocusMonitor } from '@angular/cdk/a11y';
import {
  BreakpointObserver,
  BreakpointState,
  LayoutModule
} from '@angular/cdk/layout';
import { AsyncPipe, NgClass } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, of, Subject, takeUntil, tap } from 'rxjs';

import { ThemeService } from '../../theme.service';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'tehw0lf-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  standalone: true,
  imports: [
    LayoutModule,
    MatToolbarModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    AsyncPipe
  ]
})
export class DesktopComponent implements AfterViewInit, OnInit {
  isLight: Observable<boolean> = of(false);

  burgerStyle = '';
  buttonStyle = '';

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private focusMonitor: FocusMonitor,
    private router: Router,
    private sidenavService: SidenavService,
    private themeService: ThemeService,
    private breakpointObserver: BreakpointObserver
  ) {
    breakpointObserver
      .observe(['(min-width: 960px)'])
      .pipe(
        tap((breakpointState: BreakpointState) => {
          if (breakpointState.matches) {
            this.burgerStyle = 'display: none;';
            this.buttonStyle = '';
          } else {
            this.burgerStyle = '';
            this.buttonStyle = 'display: none;';
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

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
