import { Injectable } from '@angular/core';
import { product } from 'cartesian-product-generator';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WordlistGeneratorService {
  constructor() {}

  generateWordlist(
    ...charsets: string[]
  ): Observable<IterableIterator<string[]>> {
    return of(product(...charsets));
  }
}
