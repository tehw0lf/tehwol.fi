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
      
      service.generateWordlist(charset1, charset2, charset3)
        .pipe(toArray())
        .subscribe((words) => {
          expect(words).toEqual(actualWordlist);
          done();
        });
    });

    it('should handle single character sets', (done) => {
      service.generateWordlist('a', 'b')
        .pipe(toArray())
        .subscribe((words) => {
          expect(words).toEqual(['ab']);
          done();
        });
    });

    it('should handle empty character sets', (done) => {
      service.generateWordlist('', 'a')
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
        onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
        onmessageerror: ((this: Worker, ev: MessageEvent) => any) | null = null;
        onerror: ((this: Worker, ev: ErrorEvent) => any) | null = null;
        
        constructor(scriptURL: string | URL, options?: WorkerOptions) {
          super();
        }
        
        postMessage(message: any): void {
          // Simulate worker processing for large datasets
          setTimeout(() => {
            if (this.onmessage) {
              // Send a few test words
              this.onmessage(new MessageEvent('message', {
                data: { type: 'batch', words: ['test1', 'test2'] }
              }));
              
              // Send completion
              this.onmessage(new MessageEvent('message', {
                data: { type: 'complete' }
              }));
            }
          }, 0);
        }
        
        terminate(): void {
          // Mock terminate
        }
      } as any;
    });

    it('should use Web Worker for large datasets', (done) => {
      // Create a large charset that exceeds threshold
      const largeCharset = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const charset2 = 'abcdefghijklmnopqrstuvwxyz0123456789';
      
      const words: string[] = [];
      service.generateWordlist(largeCharset, charset2)
        .subscribe({
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
      (global as any).Worker = undefined;
      
      const charset1 = '01';
      const charset2 = '23';
      
      service.generateWordlist(charset1, charset2)
        .pipe(toArray())
        .subscribe((words) => {
          expect(words).toEqual(['02', '03', '12', '13']);
          // Restore Worker
          global.Worker = originalWorker;
          done();
        });
    });
  });

  describe('Dataset size estimation', () => {
    it('should correctly estimate small dataset sizes', () => {
      // Access private method for testing
      const estimateSize = (service as any).estimateWordlistSize.bind(service);
      
      expect(estimateSize(['abc', '123'])).toBe(9); // 3 * 3
      expect(estimateSize(['ab', 'cd', 'ef'])).toBe(8); // 2 * 2 * 2
    });

    it('should correctly estimate large dataset sizes', () => {
      const estimateSize = (service as any).estimateWordlistSize.bind(service);
      const largeCharset = 'a'.repeat(100);
      
      expect(estimateSize([largeCharset, largeCharset])).toBe(10000); // 100 * 100
    });
  });

  describe('Worker error handling', () => {
    beforeEach(() => {
      // Mock Worker that throws an error
      global.Worker = class MockWorker extends EventTarget implements Worker {
        onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
        onmessageerror: ((this: Worker, ev: MessageEvent) => any) | null = null;
        onerror: ((this: Worker, ev: ErrorEvent) => any) | null = null;
        
        constructor() {
          super();
        }
        
        postMessage(): void {
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage(new MessageEvent('message', {
                data: { type: 'error', error: 'Worker test error' }
              }));
            }
          }, 0);
        }
        
        terminate(): void {
          // Mock terminate function - no implementation needed for tests
        }
      } as any;
    });

    it('should handle Worker errors gracefully', (done) => {
      const largeCharset = 'a'.repeat(300); // Force Web Worker usage
      
      service.generateWordlist(largeCharset, 'b')
        .subscribe({
          next: () => {
            // Should not emit any values
            fail('Should not emit values on error');
          },
          error: (error) => {
            expect(error.message).toBe('Worker test error');
            done();
          }
        });
    });
  });
});
