import { Component, DebugElement, Renderer2, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { OcticonDirective } from './octicon.directive';

@Component({
  template: ` <div octicon="star" color="gold" width="20px"></div> `
})
class TestOcticonDirectiveComponent {}

describe('OcticonDirective', () => {
  let component: TestOcticonDirectiveComponent;
  let fixture: ComponentFixture<TestOcticonDirectiveComponent>;
  let inputEl: DebugElement;
  let renderer: Renderer2;
  let rendererSpy: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OcticonDirective, TestOcticonDirectiveComponent],
      providers: [Renderer2]
    }).compileComponents();

    fixture = TestBed.createComponent(TestOcticonDirectiveComponent);
    renderer = fixture.componentRef.injector.get<Renderer2>(
      Renderer2 as Type<Renderer2>
    );
    rendererSpy = jest.spyOn(renderer, 'setStyle');
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('div'));

    fixture.detectChanges();
  });

  it('should create a div with golden octicon star svg as innerHTML', () => {
    expect(inputEl.attributes.color).toBe('gold');
    expect(inputEl.attributes.octicon).toBe('star');
    expect(inputEl.attributes.width).toBe('20px');
  });
});
