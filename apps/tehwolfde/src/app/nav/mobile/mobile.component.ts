import { LayoutModule } from '@angular/cdk/layout';
import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { Subject } from 'rxjs';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileComponent implements AfterViewInit, OnDestroy {
  router = inject(Router);
  themeService = inject(ThemeService);
  private sidenavService = inject(SidenavService);

  @ViewChild('sidenav', { static: true }) public sidenav:
    | MatSidenav
    | undefined;

  private unsubscribe$ = new Subject<void>();

  ngAfterViewInit(): void {
    if (this.sidenav) {
      this.sidenavService.setSidenav(this.sidenav);
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
