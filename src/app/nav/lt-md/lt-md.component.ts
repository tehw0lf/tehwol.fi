import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material";
import { Router } from "@angular/router";
import { SidenavService } from "src/app/nav/sidenav.service";

@Component({
  selector: "app-lt-md",
  templateUrl: "./lt-md.component.html",
  styleUrls: ["./lt-md.component.scss"]
})
export class LtMdComponent implements OnInit {
  @ViewChild("sidenav") public sidenav: MatSidenav;
  constructor(public router: Router, private sidenavService: SidenavService) {}

  ngOnInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
    this.router.events.subscribe(() => {
      this.sidenavService.close();
    });
  }

  isActive(): boolean {
    return (
      this.router.isActive("/", true) || this.router.isActive("/home", true)
    );
  }

  toggleSidenav() {
    this.sidenavService.toggle();
  }

  uselessfn() {
    console.log("");
  }
}
