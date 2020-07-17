import { Injectable } from '@angular/core';
import { product } from 'cartesian-product-generator';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WordlistGeneratorService {
  private wordlist$: Observable<IterableIterator<string[]>>;
  constructor() {}

  generateWordlist(...charsets: string[]): void {
    this.wordlist$ = of(product(...charsets));
  }

  getWordlist(): Observable<IterableIterator<string[]>> {
    return this.wordlist$;
  }
}
