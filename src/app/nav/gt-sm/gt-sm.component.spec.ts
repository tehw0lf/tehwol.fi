import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MatIconModule, MatToolbarModule } from "@angular/material";
import { RouterTestingModule } from "@angular/router/testing";

import { GtSmComponent } from "./gt-sm.component";

describe("GtSmComponent", () => {
  let component: GtSmComponent;
  let fixture: ComponentFixture<GtSmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatIconModule, MatToolbarModule],
      declarations: [GtSmComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GtSmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
