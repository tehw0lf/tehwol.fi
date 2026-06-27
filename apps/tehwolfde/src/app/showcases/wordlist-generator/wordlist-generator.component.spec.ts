import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WordlistGeneratorComponent } from './wordlist-generator.component';

describe('WordlistGeneratorComponent', () => {
  let component: WordlistGeneratorComponent;
  let fixture: ComponentFixture<WordlistGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordlistGeneratorComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WordlistGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
