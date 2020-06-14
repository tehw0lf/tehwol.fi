import { Injectable } from '@angular/core';
import { product } from 'cartesian-product-generator';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WordlistGeneratorService {
  constructor() {}

  generateWordlist(...charsets: string[]) {
    return of(product(...charsets));
  }
}
