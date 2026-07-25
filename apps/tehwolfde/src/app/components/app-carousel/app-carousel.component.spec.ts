import {
  ComponentFixture,
  DeferBlockBehavior,
  TestBed
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppCarouselComponent } from './app-carousel.component';

describe('AppCarouselComponent', () => {
  let component: AppCarouselComponent;
  let fixture: ComponentFixture<AppCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCarouselComponent],
      providers: [provideRouter([])],
      deferBlockBehavior: DeferBlockBehavior.Manual
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on the first slide with back disabled', () => {
    expect(component.activeIndex()).toBe(0);
    expect(component.canScrollBack()).toBe(false);
    expect(component.canScrollForward()).toBe(true);
  });

  it('should advance and go back', () => {
    component.scrollBy(1);
    expect(component.activeIndex()).toBe(1);
    expect(component.canScrollBack()).toBe(true);

    component.scrollBy(-1);
    expect(component.activeIndex()).toBe(0);
  });

  it('should clamp at both ends', () => {
    component.scrollBy(-1);
    expect(component.activeIndex()).toBe(0);

    component.scrollTo(component.apps.length + 5);
    expect(component.activeIndex()).toBe(component.apps.length - 1);
    expect(component.canScrollForward()).toBe(false);
  });

  it('should only mount iframes for the active slide and its neighbours', () => {
    component.scrollTo(4);

    expect(component.shouldLoad(3)).toBe(true);
    expect(component.shouldLoad(4)).toBe(true);
    expect(component.shouldLoad(5)).toBe(true);
    expect(component.shouldLoad(2)).toBe(false);
    expect(component.shouldLoad(6)).toBe(false);
  });

  it('should expose every embedded app', () => {
    expect(component.apps.map((app) => app.route)).toEqual([
      '/flowdive',
      '/numveil',
      '/beep',
      '/btrain',
      '/mutuals',
      '/wowquote2-manager',
      '/color',
      '/farbduell'
    ]);
  });

  it('should title-case slugs and keep brand casing', () => {
    const titles = component.apps.map((app) => app.title);

    expect(titles).toContain('Flowdive');
    expect(titles).toContain('BTrain');
    expect(titles).toContain('WoWQuote2 Manager');
  });
});
