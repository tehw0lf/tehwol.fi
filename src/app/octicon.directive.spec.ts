import { Component, DebugElement, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { OcticonDirective } from './octicon.directive';

@Component({
  template: ` <div octicon="star" color="gold" width="20px"></div> `
})
class TestOcticonDirectiveComponent {}

describe('OcticonDirective', () => {
  let fixture: ComponentFixture<TestOcticonDirectiveComponent>;
  let inputEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OcticonDirective, TestOcticonDirectiveComponent],
      providers: [Renderer2]
    }).compileComponents();

    fixture = TestBed.createComponent(TestOcticonDirectiveComponent);
    inputEl = fixture.debugElement.query(By.css('div'));

    fixture.detectChanges();
  });

  it('should create a div with golden octicon star svg as innerHTML', () => {
    expect(inputEl.attributes.color).toBe('gold');
    expect(inputEl.attributes.octicon).toBe('star');
    expect(inputEl.attributes.width).toBe('20px');
  });
});
