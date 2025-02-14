import { LayoutModule } from '@angular/cdk/layout';
import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ThemeService } from '../../theme.service';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'tehw0lf-mobile',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss'],
  imports: [
    LayoutModule,
    MatSidenavModule,
    NgClass,
    MatListModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    RouterOutlet
  ]
})
export class MobileComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav', { static: true }) public sidenav:
    | MatSidenav
    | undefined;

  private unsubscribe$ = new Subject<void>();
  constructor(
    public router: Router,
    public themeService: ThemeService,
    private sidenavService: SidenavService
  ) {}

  ngOnInit(): void {
    if (this.sidenav) {
      this.sidenavService.setSidenav(this.sidenav);
    }

    this.router.events
      .pipe(
        tap(() => {
          this.sidenavService.close();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isActive(): boolean {
    return (
      this.router.isActive('/', true) || this.router.isActive('/home', true)
    );
  }
  closeSidenav(): void {
    this.sidenavService.close();
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
