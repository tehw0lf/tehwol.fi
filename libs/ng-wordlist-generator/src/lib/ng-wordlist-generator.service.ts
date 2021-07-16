import { Injectable } from '@angular/core';
import { product } from 'cartesian-product-generator';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NgWordlistGeneratorService {
  constructor() {
    //
  }

  generateWordlist(...charsets: string[]): Observable<string> {
    return from(product(...charsets)).pipe(
      map((word: string[]) => {
        return word.join('');
      })
    );
  }
}
