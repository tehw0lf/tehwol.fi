import { FocusMonitor } from '@angular/cdk/a11y';
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SidenavService } from 'src/app/nav/sidenav.service';

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss']
})
export class DesktopComponent implements AfterViewInit {
  constructor(
    private focusMonitor: FocusMonitor,
    private router: Router,
    private sidenavService: SidenavService
  ) {}

  ngAfterViewInit(): void {
    this.focusMonitor.stopMonitoring(document.getElementById('menu'));
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
