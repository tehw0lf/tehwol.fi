import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { WordlistGeneratorService } from './wordlist-generator.service';

@Component({
  selector: 'app-wordlist-generator',
  templateUrl: './wordlist-generator.component.html',
  styleUrls: ['./wordlist-generator.component.scss']
})
export class WordlistGeneratorComponent implements OnInit {
  wordlist$: Observable<IterableIterator<any[]>>;
  charsetForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private wordlistGenerator: WordlistGeneratorService
  ) {}

  ngOnInit() {
    if (this.charsetForm === undefined) {
      this.generateForm();
    }
    this.generateWordlist('123', '456');
  }

  get charsets() {
    return this.charsetForm.get('charsets') as FormArray;
  }

  addCharset() {
    this.charsets.push(this.formBuilder.control(''));
  }

  generateForm() {
    this.charsetForm = this.formBuilder.group({
      charsets: this.formBuilder.array([this.formBuilder.control('')])
    });
  }

  generateWordlist(...charsets) {
    console.log(charsets);
    console.log(...charsets);
    this.wordlist$ = this.wordlistGenerator.generateWordlist(...charsets);
  }
}
