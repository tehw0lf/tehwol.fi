import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SidenavService } from "src/app/nav/sidenav.service";

@Component({
  selector: "app-gt-sm",
  templateUrl: "./gt-sm.component.html",
  styleUrls: ["./gt-sm.component.scss"]
})
export class GtSmComponent implements OnInit {
  constructor(private router: Router, private sidenavService: SidenavService) {}

  ngOnInit() {}

  isActive(): boolean {
    return (
      this.router.isActive("/", true) || this.router.isActive("/home", true)
    );
  }

  toggleSidenav() {
    this.sidenavService.toggle();
  }
}
