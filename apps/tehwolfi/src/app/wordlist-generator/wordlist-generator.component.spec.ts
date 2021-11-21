import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WordlistGeneratorModule } from '@tehw0lf/wordlist-generator';

import { WordlistGeneratorComponent } from './wordlist-generator.component';

describe('WordlistGeneratorComponent', () => {
  let component: WordlistGeneratorComponent;
  let fixture: ComponentFixture<WordlistGeneratorComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [WordlistGeneratorModule],
        declarations: [WordlistGeneratorComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WordlistGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
