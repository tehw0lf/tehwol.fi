import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ThemeService } from '../../theme.service';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'tehw0lf-mobile',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss']
})
export class MobileComponent implements OnInit, OnDestroy {
  @Input() buttonStyle = {
    color: '#cc7832',
    'vertical-align': 'middle',
    'line-height': '36px',
    'font-size': '18px',
    margin: '0 10px 0 0',
    'text-align': 'center',
    'text-decoration': 'none'
  };

  @ViewChild('sidenav', { static: true }) public sidenav:
    | MatSidenav
    | undefined;

  isLight: Observable<boolean> = of(false);

  private unsubscribe$ = new Subject<void>();
  constructor(
    public router: Router,
    private sidenavService: SidenavService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.isLight = this.themeService.isLight;

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
