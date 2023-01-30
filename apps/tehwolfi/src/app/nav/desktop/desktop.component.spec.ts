import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SidenavService } from '../sidenav.service';
import { DesktopComponent } from './desktop.component';

const mockSidenavService = {
  toggle: jest.fn()
};

describe('DesktopComponent', () => {
  let component: DesktopComponent;
  let fixture: ComponentFixture<DesktopComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: SidenavService, useValue: mockSidenavService }],
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

  it('should toggle sidenav', () => {
    component.toggleSidenav();
    expect(mockSidenavService.toggle).toHaveBeenCalled();
  });
});
