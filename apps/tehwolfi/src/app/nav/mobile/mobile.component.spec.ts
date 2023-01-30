import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SidenavService } from '../sidenav.service';
import { MobileComponent } from './mobile.component';

const mockSidenavService = {
  setSidenav: jest.fn(),
  toggle: jest.fn()
};

describe('MobileComponent', () => {
  let component: MobileComponent;
  let fixture: ComponentFixture<MobileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [MobileComponent],
      providers: [{ provide: SidenavService, useValue: mockSidenavService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the sidenav', () => {
    component.toggleSidenav();
    expect(mockSidenavService.toggle).toHaveBeenCalled();
  });
});
