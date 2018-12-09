import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule, MatToolbarModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';

import { DesktopComponent } from './desktop.component';

describe('DesktopComponent', () => {
  let component: DesktopComponent;
  let fixture: ComponentFixture<DesktopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatIconModule, MatToolbarModule],
      declarations: [DesktopComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
