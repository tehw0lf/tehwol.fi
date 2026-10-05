import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';

import { ThemeService } from '../../services/theme.service';
import { EmbedComponent } from './embed.component';

describe('EmbedComponent', () => {
  let component: EmbedComponent;
  let fixture: ComponentFixture<EmbedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedComponent],
      providers: [provideHttpClient(withXhr())]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbedComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('url', 'https://example.com/');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute safeUrl from url input', () => {
    expect(component.safeUrl()).toBeTruthy();
  });

  it('should call sendMessage without throwing', () => {
    expect(() => component.sendMessage({ type: 'test' })).not.toThrow();
  });

  it('should call onIframeLoad without throwing', () => {
    expect(() => component.onIframeLoad()).not.toThrow();
  });

  it('should post messages to the iframe with the origin of the url', () => {
    const iframe: HTMLIFrameElement =
      fixture.nativeElement.querySelector('iframe');
    const postMessage = jest
      .spyOn(iframe.contentWindow as Window, 'postMessage')
      .mockImplementation();

    component.sendMessage({ type: 'test' });

    expect(postMessage).toHaveBeenCalledWith(
      { type: 'test' },
      'https://example.com'
    );
  });

  it('should post the theme to the iframe when the theme changes', () => {
    const iframe: HTMLIFrameElement =
      fixture.nativeElement.querySelector('iframe');
    const postMessage = jest
      .spyOn(iframe.contentWindow as Window, 'postMessage')
      .mockImplementation();

    TestBed.inject(ThemeService).theme.set('light');
    TestBed.tick();

    expect(postMessage).toHaveBeenCalledWith(
      { type: 'theme', theme: 'light' },
      'https://example.com'
    );
  });

  it('should not read the required url input before it is bound', () => {
    const unbound = TestBed.createComponent(EmbedComponent).componentInstance;

    expect(() => unbound.sendMessage({ type: 'theme' })).not.toThrow();
  });
});
