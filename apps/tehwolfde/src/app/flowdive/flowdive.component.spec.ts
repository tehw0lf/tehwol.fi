import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowdiveComponent } from './flowdive.component';

describe('FlowdiveComponent', () => {
  let component: FlowdiveComponent;
  let fixture: ComponentFixture<FlowdiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowdiveComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowdiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
