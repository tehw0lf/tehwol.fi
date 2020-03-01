import { Injectable } from '@angular/core';
import { product } from 'cartesian-product-generator';
import { of } from 'rxjs/internal/observable/of';

@Injectable({
  providedIn: 'root'
})
export class WordlistGeneratorService {
  constructor() {}

  generateWordlist(
    charset1?,
    charset2?,
    charset3?,
    charset4?,
    charset5?,
    charset6?
  ) {
    return of(
      product(charset1, charset2, charset3, charset4, charset5, charset6)
    );
  }
}
