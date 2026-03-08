import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  Signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { isActive, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

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
export class DesktopComponent implements OnDestroy {
  themeService = inject(ThemeService);
  private router = inject(Router);
  private sidenavService = inject(SidenavService);
  private breakpointObserver = inject(BreakpointObserver);
  private unsubscribe$: Subject<void> = new Subject();

  private isLargeScreen = toSignal(
    this.breakpointObserver
      .observe(['(min-width: 960px)'])
      .pipe(takeUntil(this.unsubscribe$)),
    { initialValue: { matches: false, breakpoints: {} } }
  );

  burgerStyle = computed(() =>
    this.isLargeScreen().matches ? 'display: none;' : ''
  );

  buttonStyle = computed(() =>
    this.isLargeScreen().matches ? '' : 'display: none;'
  );
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private isRootActive = isActive('/', this.router, {
    paths: 'exact',
    queryParams: 'exact',
    fragment: 'ignored',
    matrixParams: 'ignored'
  });
  private isHomeActive = isActive('/home', this.router, {
    paths: 'exact',
    queryParams: 'exact',
    fragment: 'ignored',
    matrixParams: 'ignored'
  });
  isActive: Signal<boolean> = computed(
    () => this.isRootActive() || this.isHomeActive()
  );

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
