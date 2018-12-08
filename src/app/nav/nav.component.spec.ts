import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";

import { GtSmComponent } from "./gt-sm/gt-sm.component";
import { LtMdComponent } from "./lt-md/lt-md.component";
import { NavComponent } from "./nav.component";

describe("NavComponent", () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule
      ],
      declarations: [NavComponent, GtSmComponent, LtMdComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
