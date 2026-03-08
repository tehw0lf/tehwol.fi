import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { EmbedComponent } from './embed.component';

describe('EmbedComponent', () => {
  let component: EmbedComponent;
  let fixture: ComponentFixture<EmbedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedComponent],
      providers: [provideHttpClient()]
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
});
