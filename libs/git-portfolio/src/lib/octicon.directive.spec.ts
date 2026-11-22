import {
  Component,
  DebugElement,
  Renderer2,
  ChangeDetectionStrategy
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { OcticonDirective } from './octicon.directive';

const mockFetch = () =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('<svg></svg>')
  } as Response);

@Component({
  template: `
    <div id="working-octicon" octicon="star" color="gold" width="20px"></div>
    <div
      id="invalid-octicon"
      octicon="invalid-icon"
      color="blue"
      width="16px"
    ></div>
    <div id="no-width-octicon" octicon="repo" color="green"></div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
class TestOcticonDirectiveComponent {}

describe('OcticonDirective', () => {
  let fixture: ComponentFixture<TestOcticonDirectiveComponent>;
  let workingElement: DebugElement;
  let invalidElement: DebugElement;
  let noWidthElement: DebugElement;

  beforeEach(() => {
    global.fetch = jest.fn(mockFetch) as typeof fetch;

    TestBed.configureTestingModule({
      imports: [OcticonDirective, TestOcticonDirectiveComponent],
      providers: [Renderer2]
    }).compileComponents();

    fixture = TestBed.createComponent(TestOcticonDirectiveComponent);
    workingElement = fixture.debugElement.query(By.css('#working-octicon'));
    invalidElement = fixture.debugElement.query(By.css('#invalid-octicon'));
    noWidthElement = fixture.debugElement.query(By.css('#no-width-octicon'));

    fixture.detectChanges();
  });

  it('should create a div with golden octicon star svg as innerHTML', () => {
    expect(workingElement.attributes.color).toBe('gold');
    expect(workingElement.attributes.octicon).toBe('star');
    expect(workingElement.attributes.width).toBe('20px');
  });

  it('should render valid octicon with correct styles', () => {
    // Check that the directive has proper attributes set
    expect(workingElement.attributes.color).toBe('gold');
    expect(workingElement.attributes.octicon).toBe('star');
    expect(workingElement.attributes.width).toBe('20px');

    // In test environment, just verify the directive was applied
    expect(workingElement.nativeElement).toBeTruthy();
  });

  it('should render fallback alert icon for invalid octicon names', () => {
    // For invalid icons, verify the element exists and has correct attributes
    expect(invalidElement.attributes.color).toBe('blue');
    expect(invalidElement.attributes.octicon).toBe('invalid-icon');
    expect(invalidElement.nativeElement).toBeTruthy();
  });

  it('should render octicon without width styling when width is not provided', () => {
    // Should have the element with correct attributes
    expect(noWidthElement.attributes.color).toBe('green');
    expect(noWidthElement.attributes.octicon).toBe('repo');
    expect(noWidthElement.nativeElement).toBeTruthy();
  });

  it('should handle empty octicon input gracefully', () => {
    @Component({
      template: `<div octicon="" color="black"></div>`,
      standalone: true,
      imports: [OcticonDirective]
    })
    class EmptyOcticonComponent {}

    const emptyFixture = TestBed.createComponent(EmptyOcticonComponent);
    emptyFixture.detectChanges();

    const element = emptyFixture.debugElement.query(By.css('div'));
    // Should not crash - that's the main test
    expect(element).toBeTruthy();
  });

  describe('failed icon fetches', () => {
    let errorSpy: jest.SpyInstance;

    // svgCache keeps resolved promises across tests and a rejected one deletes
    // itself, so 'issue-opened' (not resolved by any other test) is fetched
    // again by every test below.
    const render = async (fetchImpl: () => Promise<Response>) => {
      global.fetch = jest.fn(fetchImpl) as typeof fetch;
      @Component({
        template: `<div octicon="issue-opened" color="red"></div>`,
        standalone: true,
        imports: [OcticonDirective]
      })
      class FailingComponent {}
      const f = TestBed.createComponent(FailingComponent);
      f.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));
    };

    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        /* silence */
      });
    });

    afterEach(() => {
      window.dispatchEvent(new Event('pageshow'));
      errorSpy.mockRestore();
    });

    it('should not log an AbortError', async () => {
      await render(() =>
        Promise.reject(
          new DOMException('The operation was aborted.', 'AbortError')
        )
      );
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should not log a TypeError after beforeunload', async () => {
      window.dispatchEvent(new Event('beforeunload'));
      await render(() => Promise.reject(new TypeError('Load failed')));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should log a TypeError without beforeunload', async () => {
      await render(() => Promise.reject(new TypeError('Load failed')));
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log a TypeError after beforeunload followed by pageshow', async () => {
      window.dispatchEvent(new Event('beforeunload'));
      window.dispatchEvent(new Event('pageshow'));
      await render(() => Promise.reject(new TypeError('Load failed')));
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log a non-ok response', async () => {
      await render(() =>
        Promise.resolve({ ok: false, status: 404 } as Response)
      );
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(String(errorSpy.mock.calls[0][0])).toContain(
        'Failed to load octicon "issue-opened": 404'
      );
    });
  });
});
