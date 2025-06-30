import { TestBed } from '@angular/core/testing';
import { toArray } from 'rxjs/operators';

import { WordlistGeneratorService } from './wordlist-generator.service';

const actualWordlist = [
  '037',
  '137',
  '237',
  '047',
  '147',
  '247',
  '057',
  '157',
  '257',
  '038',
  '138',
  '238',
  '048',
  '148',
  '248',
  '058',
  '158',
  '258',
  '039',
  '139',
  '239',
  '049',
  '149',
  '249',
  '059',
  '159',
  '259'
];

describe('WordlistGeneratorService', () => {
  let service: WordlistGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordlistGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Small datasets (synchronous generation)', () => {
    it('should create a wordlist for small datasets', (done) => {
      const charset1 = '012';
      const charset2 = '345';
      const charset3 = '789';

      service
        .generateWordlist(charset1, charset2, charset3)
        .pipe(toArray())
        .subscribe((words) => {
          expect(words).toEqual(actualWordlist);
          done();
        });
    });

    it('should handle single character sets', (done) => {
      service
        .generateWordlist('a', 'b')
        .pipe(toArray())
        .subscribe((words) => {
          expect(words).toEqual(['ab']);
          done();
        });
    });

    it('should handle empty character sets', (done) => {
      service
        .generateWordlist('', 'a')
        .pipe(toArray())
        .subscribe((words) => {
          expect(words).toEqual([]);
          done();
        });
    });
  });

  describe('Large datasets (Web Worker generation)', () => {
    beforeEach(() => {
      // Mock Worker for testing
      global.Worker = class MockWorker extends EventTarget implements Worker {
        onmessage: ((this: Worker, ev: MessageEvent) => void) | null = null;
        onmessageerror: ((this: Worker, ev: MessageEvent) => void) | null =
          null;
        onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null = null;

        constructor(_scriptURL: string | URL, _options?: WorkerOptions) {
          super();
        }

        postMessage(_message: unknown): void {
          // Simulate worker processing for large datasets
          setTimeout(() => {
            if (this.onmessage) {
              // Send a few test words
              this.onmessage(
                new MessageEvent('message', {
                  data: { type: 'batch', words: ['test1', 'test2'] }
                })
              );

              // Send completion
              this.onmessage(
                new MessageEvent('message', {
                  data: { type: 'complete' }
                })
              );
            }
          }, 0);
        }

        terminate(): void {
          // Mock terminate
        }
      } as unknown as typeof Worker;
    });

    it('should use Web Worker for large datasets', (done) => {
      // Create a large charset that exceeds threshold (50000)
      const largeCharset1 = 'a'.repeat(250); // 250 chars
      const largeCharset2 = 'b'.repeat(250); // 250 chars
      // 250 * 250 = 62500 > 50000, so this will use Web Worker

      const words: string[] = [];
      service.generateWordlist(largeCharset1, largeCharset2).subscribe({
        next: (word) => words.push(word),
        complete: () => {
          expect(words).toContain('test1');
          expect(words).toContain('test2');
          done();
        }
      });
    });

    it('should fallback to synchronous generation when Worker is not available', (done) => {
      // Temporarily disable Worker
      const originalWorker = global.Worker;
      (global as { Worker?: typeof Worker }).Worker = undefined;

      // Use a simple test with small data that definitely should work
      service
        .generateWordlist('ab', 'cd')
        .pipe(toArray())
        .subscribe({
          next: (words) => {
            // Should fallback to synchronous generation and produce results
            expect(words.length).toBeGreaterThan(0);
            expect(words).toContain('ac');
            expect(words).toContain('ad');
            expect(words).toContain('bc');
            expect(words).toContain('bd');
            
            // Restore Worker
            global.Worker = originalWorker;
            done();
          },
          error: (error) => {
            // Restore Worker even if test fails
            global.Worker = originalWorker;
            done(error);
          }
        });
    });
  });

  describe('Dataset size estimation', () => {
    it('should correctly estimate small dataset sizes', () => {
      // Access private method for testing
      expect(service['estimateWordlistSize'](['abc', '123'])).toBe(9); // 3 * 3
      expect(service['estimateWordlistSize'](['ab', 'cd', 'ef'])).toBe(8); // 2 * 2 * 2
    });

    it('should correctly estimate large dataset sizes', () => {
      const largeCharset = 'a'.repeat(100);

      expect(
        service['estimateWordlistSize']([largeCharset, largeCharset])
      ).toBe(10000); // 100 * 100
    });
  });

  describe('Worker error handling', () => {
    beforeEach(() => {
      // Mock Worker that throws an error
      global.Worker = class MockWorker extends EventTarget implements Worker {
        onmessage: ((this: Worker, ev: MessageEvent) => void) | null = null;
        onmessageerror: ((this: Worker, ev: MessageEvent) => void) | null =
          null;
        onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null =
          null;

        constructor() {
          super();
        }

        postMessage(): void {
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage(
                new MessageEvent('message', {
                  data: { type: 'error', error: 'Worker test error' }
                })
              );
            }
          }, 0);
        }

        terminate(): void {
          // Mock terminate function - no implementation needed for tests
        }
      } as unknown as typeof Worker;
    });

    it('should handle Worker errors gracefully', (done) => {
      // Create dataset large enough to exceed threshold (50000)
      const largeCharset1 = 'a'.repeat(250); // 250 chars
      const largeCharset2 = 'b'.repeat(250); // 250 chars
      // 250 * 250 = 62500 > 50000, so this will use Web Worker

      service.generateWordlist(largeCharset1, largeCharset2).subscribe({
        next: (value) => {
          done(
            new Error(`Should not emit values on error, but got: ${value}`)
          );
        },
        error: (error) => {
          expect(error.message).toBe('Worker test error');
          done();
        },
        complete: () => {
          done(new Error('Should not complete when there is an error'));
        }
      });
    });
  });
});
