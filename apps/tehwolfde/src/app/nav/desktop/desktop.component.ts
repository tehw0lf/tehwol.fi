import { FocusMonitor } from '@angular/cdk/a11y';
import {
  BreakpointObserver,
  BreakpointState,
  LayoutModule
} from '@angular/cdk/layout';
import { NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil, tap } from 'rxjs';

import { ThemeService } from '../../theme.service';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'tehw0lf-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  imports: [
    LayoutModule,
    MatToolbarModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopComponent implements AfterViewInit, OnDestroy {
  themeService = inject(ThemeService);
  private focusMonitor = inject(FocusMonitor);
  private router = inject(Router);
  private sidenavService = inject(SidenavService);
  private breakpointObserver = inject(BreakpointObserver);
  private cdr = inject(ChangeDetectorRef);

  burgerStyle = '';
  buttonStyle = '';

  private unsubscribe$: Subject<void> = new Subject();

  constructor() {
    const breakpointObserver = this.breakpointObserver;

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
          this.cdr.markForCheck();
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isActive(): boolean {
    return (
      this.router.isActive('/', {
        paths: 'exact',
        queryParams: 'exact',
        fragment: 'ignored',
        matrixParams: 'ignored'
      }) ||
      this.router.isActive('/home', {
        paths: 'exact',
        queryParams: 'exact',
        fragment: 'ignored',
        matrixParams: 'ignored'
      })
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
