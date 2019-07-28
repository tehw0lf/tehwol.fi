import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { SidenavService } from '../sidenav.service';
import { MobileComponent } from './mobile.component';

describe('MobileComponent', () => {
  let component: MobileComponent;
  let fixture: ComponentFixture<MobileComponent>;
  let service: SidenavService;
  let toggleSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule
      ],
      declarations: [MobileComponent],
      providers: [SidenavService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileComponent);
    service = TestBed.get(SidenavService);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(service, 'setSidenav').and.callFake(() => {});
    toggleSpy = spyOn(service, 'toggle');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the sidenav', () => {
    component.toggleSidenav();

    expect(toggleSpy).toHaveBeenCalled();
  });
});
