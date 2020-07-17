import { Injectable } from '@angular/core';
import { product } from 'cartesian-product-generator';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WordlistGeneratorService {
  private wordlist$: ReplaySubject<IterableIterator<string[]>>;
  constructor() {}

  generateWordlist(...charsets: string[]): void {
    if (this.wordlist$ === undefined) {
      this.wordlist$ = new ReplaySubject();
    }
    console.log('next value:', ...charsets);
    this.wordlist$.next(product(...charsets));
  }

  getWordlist(): Observable<IterableIterator<string[]>> {
    return this.wordlist$.asObservable();
  }
}
