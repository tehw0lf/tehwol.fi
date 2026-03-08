import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { BtrainComponent } from './btrain.component';

describe('BtrainComponent', () => {
  let component: BtrainComponent;
  let fixture: ComponentFixture<BtrainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtrainComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BtrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
