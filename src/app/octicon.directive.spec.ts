import { Component, DebugElement, Renderer2, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import * as octicons from 'octicons';

import { OcticonDirective } from './octicon.directive';

@Component({
  template: `
    <div octicon="star" color="gold"></div>
  `
})
class TestOcticonDirectiveComponent {}

describe('OcticonDirective', () => {
  let component: TestOcticonDirectiveComponent;
  let fixture: ComponentFixture<TestOcticonDirectiveComponent>;
  let inputEl: DebugElement;
  let renderer: Renderer2;
  let rendererSpy: any;
  let star: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OcticonDirective, TestOcticonDirectiveComponent],
      providers: [Renderer2]
    }).compileComponents();

    fixture = TestBed.createComponent(TestOcticonDirectiveComponent);
    renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<
      Renderer2
    >);
    rendererSpy = jest.spyOn(renderer, 'setStyle');
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('div'));

    fixture.detectChanges();
  });

  it('should create a div with golden octicon star svg as innerHTML', () => {
    star = octicons['star'].toSVG().replace('/>', '></path>');

    expect(rendererSpy).toHaveBeenCalled();
    expect(inputEl.attributes.color).toBe('gold');
    expect(inputEl.attributes.octicon).toBe('star');
    expect(inputEl.nativeElement.innerHTML).toBe(star);
  });
});
