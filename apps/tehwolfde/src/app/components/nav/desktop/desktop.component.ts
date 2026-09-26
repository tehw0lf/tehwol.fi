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
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  isActive,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { EMBEDDED_APPS } from '../../../embeds/apps';
import { LanguageSwitcherComponent } from '../../../i18n/language-switcher.component';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';
import { ThemeService } from '../../../services/theme.service';
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
    MatMenuModule,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LanguageSwitcherComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopComponent implements OnDestroy {
  readonly apps = EMBEDDED_APPS;

  themeService = inject(ThemeService);
  translateService = inject(TranslateService);
  private router = inject(Router);
  private sidenavService = inject(SidenavService);
  private breakpointObserver = inject(BreakpointObserver);
  private unsubscribe$: Subject<void> = new Subject();

  // 1280px, not a round 960: it is the width at which the toolbar's content
  // actually fits. Measured in Chromium with all five links — the German row
  // needs 924px for the links plus 312px for the theme toggle, the language
  // switcher and the GitHub link, plus 32px of toolbar padding. At 1152px the
  // German labels are already cut off; at 960px both locales are.
  //
  // Below this the burger menu renders instead, which fits any width. The
  // link container keeps its min-width: 0 and overflow-x for the case a
  // future label outgrows even this, but that is a fallback, not the plan.
  private isLargeScreen = toSignal(
    this.breakpointObserver
      .observe(['(min-width: 1280px)'])
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
