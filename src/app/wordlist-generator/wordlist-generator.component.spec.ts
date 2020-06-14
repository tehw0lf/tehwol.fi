import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordlistGeneratorComponent } from './wordlist-generator.component';

describe('WordlistGeneratorComponent', () => {
  let component: WordlistGeneratorComponent;
  let fixture: ComponentFixture<WordlistGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WordlistGeneratorComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordlistGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
