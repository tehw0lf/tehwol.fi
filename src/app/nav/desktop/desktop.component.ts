import { FocusMonitor } from '@angular/cdk/a11y';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidenavService } from 'src/app/nav/sidenav.service';

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss']
})
export class DesktopComponent implements AfterViewInit, OnInit {
  constructor(
    private focusMonitor: FocusMonitor,
    private router: Router,
    private sidenavService: SidenavService
  ) {}

  ngAfterViewInit() {
    this.focusMonitor.stopMonitoring(document.getElementById('menu'));
  }
  ngOnInit() {}

  isActive(): boolean {
    return (
      this.router.isActive('/', true) || this.router.isActive('/home', true)
    );
  }

  toggleSidenav() {
    this.sidenavService.toggle();
  }
}
