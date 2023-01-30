import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private sidenav: MatSidenav | undefined;

  public setSidenav(sidenav: MatSidenav): void {
    this.sidenav = sidenav;
  }

  public open(): Promise<MatDrawerToggleResult> | undefined {
    if (this.sidenav) {
      return this.sidenav.open();
    }
    return undefined;
  }

  public close(): Promise<MatDrawerToggleResult> | undefined {
    if (this.sidenav) {
      return this.sidenav.close();
    }
    return undefined;
  }

  public toggle(): Promise<MatDrawerToggleResult> | undefined {
    if (this.sidenav) {
      return this.sidenav.toggle();
    }
    return undefined;
  }
}
