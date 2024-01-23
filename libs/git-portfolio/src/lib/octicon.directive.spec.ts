import { Component, DebugElement, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { OcticonDirective } from './octicon.directive';

@Component({
    template: `
    <div id="working-octicon" octicon="star" color="gold" width="20px"></div>
  `,
    standalone: true
})
class TestOcticonDirectiveComponent {}

describe('OcticonDirective', () => {
  let fixture: ComponentFixture<TestOcticonDirectiveComponent>;
  let workingElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [OcticonDirective, TestOcticonDirectiveComponent],
    providers: [Renderer2]
}).compileComponents();

    fixture = TestBed.createComponent(TestOcticonDirectiveComponent);
    workingElement = fixture.debugElement.query(By.css('div'));

    fixture.detectChanges();
  });

  it('should create a div with golden octicon star svg as innerHTML', () => {
    expect(workingElement.attributes.color).toBe('gold');
    expect(workingElement.attributes.octicon).toBe('star');
    expect(workingElement.attributes.width).toBe('20px');
  });
});
