import { Injectable } from '@angular/core';
import { product } from 'cartesian-product-generator';
import { from, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class WordlistGeneratorService {
  private readonly LARGE_DATASET_THRESHOLD = 50000;

  generateWordlist(...charsets: string[]): Observable<string> {
    const estimatedSize = this.estimateWordlistSize(charsets);
    
    if (estimatedSize > this.LARGE_DATASET_THRESHOLD) {
      return this.generateWithWebWorker(charsets);
    }
    
    return this.generateSynchronously(charsets);
  }

  private generateSynchronously(charsets: string[]): Observable<string> {
    return from(product(...charsets)).pipe(
      map((word: string[]) => word.join(''))
    );
  }

  private generateWithWebWorker(charsets: string[]): Observable<string> {
    const subject = new Subject<string>();
    
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('./wordlist.worker', import.meta.url));
      
      worker.onmessage = ({ data }: MessageEvent<WordlistWorkerResponse>) => {
        switch (data.type) {
          case 'batch':
            if (data.words) {
              data.words.forEach(word => subject.next(word));
            }
            break;
          case 'complete':
            subject.complete();
            worker.terminate();
            break;
          case 'error':
            subject.error(new Error(data.error || 'Worker error'));
            worker.terminate();
            break;
        }
      };
      
      worker.onerror = (error) => {
        subject.error(error);
        worker.terminate();
      };
      
      const message: WordlistWorkerMessage = {
        type: 'generate',
        charsets,
        batchSize: 1000
      };
      
      worker.postMessage(message);
    } else {
      // Fallback for environments without Worker support
      this.generateSynchronously(charsets).subscribe(subject);
    }
    
    return subject.asObservable();
  }

  private estimateWordlistSize(charsets: string[]): number {
    return charsets.reduce((total, charset) => total * charset.length, 1);
  }
}
