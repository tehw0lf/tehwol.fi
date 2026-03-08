import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { BeepSimulatorComponent } from './beep.component';

describe('BeepSimulatorComponent', () => {
  let component: BeepSimulatorComponent;
  let fixture: ComponentFixture<BeepSimulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeepSimulatorComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeepSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
