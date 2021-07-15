import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'tehw0lf-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss']
})
export class MobileComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav', { static: true }) public sidenav:
    | MatSidenav
    | undefined;

  private unsubscribe$ = new Subject<void>();
  constructor(public router: Router, private sidenavService: SidenavService) {}

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

  toggleSidenav(): void {
    this.sidenavService.toggle();
  }
}
