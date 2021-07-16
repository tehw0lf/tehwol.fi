import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgWordlistGeneratorModule } from '@tehw0lf/ng-wordlist-generator';

import { WordlistGeneratorComponent } from './wordlist-generator.component';


describe('WordlistGeneratorComponent', () => {
  let component: WordlistGeneratorComponent;
  let fixture: ComponentFixture<WordlistGeneratorComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NgWordlistGeneratorModule],
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
