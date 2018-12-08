import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MatIconModule, MatListModule, MatSidenavModule } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";

import { LtMdComponent } from "./lt-md.component";

describe("LtMdComponent", () => {
  let component: LtMdComponent;
  let fixture: ComponentFixture<LtMdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule
      ],
      declarations: [LtMdComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LtMdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
