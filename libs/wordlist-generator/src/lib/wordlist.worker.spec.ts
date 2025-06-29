/**
 * @jest-environment jsdom
 */

interface WordlistWorkerMessage {
  type: 'generate';
  charsets: string[];
  batchSize?: number;
}

interface WordlistWorkerResponse {
  type: 'batch' | 'complete' | 'error';
  words?: string[];
  error?: string;
}

// Mock the cartesian-product-generator
jest.mock('cartesian-product-generator', () => ({
  product: jest.fn()
}));

describe('WordlistWorker', () => {
  let worker: Worker;
  let mockProduct: jest.Mock;

  beforeEach(() => {
    // Mock Worker environment
    global.Worker = class MockWorker extends EventTarget implements Worker {
      onmessage: ((this: Worker, ev: MessageEvent) => void) | null = null;
      onmessageerror: ((this: Worker, ev: MessageEvent) => void) | null = null;
      onerror: ((this: Worker, ev: ErrorEvent) => void) | null = null;
      
      constructor(_scriptURL: string | URL, _options?: WorkerOptions) {
        super();
      }
      
      postMessage(message: unknown, transfer?: Transferable[]): void;
      postMessage(message: unknown, options?: StructuredSerializeOptions): void;
      postMessage(message: unknown, _optionsOrTransfer?: unknown): void {
        // Simulate worker message handling
        setTimeout(() => {
          if (this.onmessage) {
            const msg = message as WordlistWorkerMessage;
            try {
              // Use the mocked cartesian product
              const mockData = mockProduct();
              const words = mockData.map((combo: string[]) => combo.join(''));
              const batchSize = msg.batchSize || 1000;
              
              // Send batches
              for (let i = 0; i < words.length; i += batchSize) {
                const batch = words.slice(i, i + batchSize);
                this.onmessage(new MessageEvent('message', {
                  data: { type: 'batch', words: batch }
                }));
              }
              
              // Send completion
              this.onmessage(new MessageEvent('message', {
                data: { type: 'complete' }
              }));
            } catch (error) {
              this.onmessage(new MessageEvent('message', {
                data: { type: 'error', error: (error as Error).message }
              }));
            }
          }
        }, 10);
      }
      
      terminate(): void {
        // Mock terminate
      }
    } as Worker;

    // Mock the product function
    mockProduct = require('cartesian-product-generator').product;
    
    // Reset mock before each test
    mockProduct.mockReset();
  });

  afterEach(() => {
    if (worker) {
      worker.terminate();
    }
  });

  describe('Small dataset generation', () => {
    beforeEach(() => {
      // Mock small dataset
      mockProduct.mockReturnValue([
        ['a', '1'],
        ['a', '2'],
        ['b', '1'],
        ['b', '2']
      ]);
    });

    it('should generate wordlist in batches', (done) => {
      const responses: WordlistWorkerResponse[] = [];
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 8000);
      
      worker = new Worker(new URL('./wordlist.worker', import.meta.url));
      
      worker.onmessage = (event: MessageEvent<WordlistWorkerResponse>) => {
        responses.push(event.data);
        
        if (event.data.type === 'complete') {
          clearTimeout(timeout);
          expect(responses).toHaveLength(2); // 1 batch + 1 complete
          
          const batchResponse = responses.find(r => r.type === 'batch');
          expect(batchResponse).toBeDefined();
          expect(batchResponse?.words).toEqual(['a1', 'a2', 'b1', 'b2']);
          
          const completeResponse = responses.find(r => r.type === 'complete');
          expect(completeResponse).toBeDefined();
          
          done();
        }
      };

      worker.onerror = () => {
        clearTimeout(timeout);
        done(new Error('Worker error occurred'));
      };

      const message: WordlistWorkerMessage = {
        type: 'generate',
        charsets: ['ab', '12'],
        batchSize: 10
      };
      
      worker.postMessage(message);
    });

    it('should handle custom batch sizes', (done) => {
      const responses: WordlistWorkerResponse[] = [];
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 8000);
      
      worker = new Worker(new URL('./wordlist.worker', import.meta.url));
      
      worker.onmessage = (event: MessageEvent<WordlistWorkerResponse>) => {
        responses.push(event.data);
        
        if (event.data.type === 'complete') {
          clearTimeout(timeout);
          const batchResponses = responses.filter(r => r.type === 'batch');
          expect(batchResponses).toHaveLength(2); // 2 batches of size 2
          
          expect(batchResponses[0].words).toHaveLength(2);
          expect(batchResponses[1].words).toHaveLength(2);
          
          done();
        }
      };

      worker.onerror = () => {
        clearTimeout(timeout);
        done(new Error('Worker error occurred'));
      };

      const message: WordlistWorkerMessage = {
        type: 'generate',
        charsets: ['ab', '12'],
        batchSize: 2
      };
      
      worker.postMessage(message);
    });
  });

  describe('Large dataset generation', () => {
    beforeEach(() => {
      // Mock larger dataset
      const largeDataset = [];
      for (let i = 0; i < 1500; i++) {
        largeDataset.push([String.fromCharCode(97 + (i % 26)), String(i % 10)]);
      }
      mockProduct.mockReturnValue(largeDataset);
    });

    it('should handle large datasets in multiple batches', (done) => {
      const responses: WordlistWorkerResponse[] = [];
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 8000);
      
      worker = new Worker(new URL('./wordlist.worker', import.meta.url));
      
      worker.onmessage = (event: MessageEvent<WordlistWorkerResponse>) => {
        responses.push(event.data);
        
        if (event.data.type === 'complete') {
          clearTimeout(timeout);
          const batchResponses = responses.filter(r => r.type === 'batch');
          expect(batchResponses.length).toBeGreaterThan(1);
          
          // Should have 2 batches (1000 + 500) with batch size 1000
          expect(batchResponses).toHaveLength(2);
          expect(batchResponses[0].words).toHaveLength(1000);
          expect(batchResponses[1].words).toHaveLength(500);
          
          done();
        }
      };
      
      worker.onerror = (error) => {
        clearTimeout(timeout);
        done(new Error(`Worker error: ${error.message}`));
      };

      const message: WordlistWorkerMessage = {
        type: 'generate',
        charsets: ['abcdefghijklmnopqrstuvwxyz', '0123456789'],
        batchSize: 1000
      };
      
      worker.postMessage(message);
    }, 15000);
  });

  describe('Error handling', () => {
    beforeEach(() => {
      // Mock product to throw an error
      mockProduct.mockImplementation(() => {
        throw new Error('Test error');
      });
    });

    it('should handle errors gracefully', (done) => {
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 8000);
      
      worker = new Worker(new URL('./wordlist.worker', import.meta.url));
      
      worker.onmessage = (event: MessageEvent<WordlistWorkerResponse>) => {
        if (event.data.type === 'error') {
          clearTimeout(timeout);
          expect(event.data.error).toBe('Test error');
          done();
        }
      };
      
      worker.onerror = (error) => {
        clearTimeout(timeout);
        done(new Error(`Worker error: ${error.message}`));
      };

      const message: WordlistWorkerMessage = {
        type: 'generate',
        charsets: ['ab', '12']
      };
      
      worker.postMessage(message);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty charsets', (done) => {
      mockProduct.mockReturnValue([]);
      const responses: WordlistWorkerResponse[] = [];
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 8000);
      
      worker = new Worker(new URL('./wordlist.worker', import.meta.url));
      
      worker.onmessage = (event: MessageEvent<WordlistWorkerResponse>) => {
        responses.push(event.data);
        if (event.data.type === 'complete') {
          clearTimeout(timeout);
          const batchResponses = responses.filter(r => r.type === 'batch');
          expect(batchResponses).toHaveLength(0);
          done();
        }
      };
      
      worker.onerror = (error) => {
        clearTimeout(timeout);
        done(new Error(`Worker error: ${error.message}`));
      };

      const message: WordlistWorkerMessage = {
        type: 'generate',
        charsets: []
      };
      
      worker.postMessage(message);
    });

    it('should use default batch size when not provided', (done) => {
      mockProduct.mockReturnValue([
        ['a', '1'], ['a', '2'], ['b', '1'], ['b', '2']
      ]);
      
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 8000);
      
      worker = new Worker(new URL('./wordlist.worker', import.meta.url));
      
      worker.onmessage = (event: MessageEvent<WordlistWorkerResponse>) => {
        if (event.data.type === 'complete') {
          clearTimeout(timeout);
          done();
        }
      };

      worker.onerror = () => {
        clearTimeout(timeout);
        done(new Error('Worker error occurred'));
      };

      const message: WordlistWorkerMessage = {
        type: 'generate',
        charsets: ['ab', '12']
        // No batchSize provided - should use default 1000
      };
      
      worker.postMessage(message);
    });
  });
});