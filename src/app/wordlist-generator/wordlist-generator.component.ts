import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { WordlistGeneratorService } from './wordlist-generator.service';

@Component({
  selector: 'app-wordlist-generator',
  templateUrl: './wordlist-generator.component.html',
  styleUrls: ['./wordlist-generator.component.scss']
})
export class WordlistGeneratorComponent implements OnInit {
  wordlist$: Observable<IterableIterator<any[]>>;
  constructor(private wordlistGenerator: WordlistGeneratorService) {}

  ngOnInit() {
    this.generateWordlist('123', '456');
  }

  generateWordlist(...charsets) {
    this.wordlist$ = this.wordlistGenerator.generateWordlist(...charsets);
  }
}
