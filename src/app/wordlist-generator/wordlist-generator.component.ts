import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { WordlistGeneratorService } from './wordlist-generator.service';

@Component({
  selector: 'app-wordlist-generator',
  templateUrl: './wordlist-generator.component.html',
  styleUrls: ['./wordlist-generator.component.scss']
})
export class WordlistGeneratorComponent implements OnInit {
  wordlist$: Observable<IterableIterator<string[]>>;
  charsetForm: FormGroup;
  consol = console;
  constructor(
    private formBuilder: FormBuilder,
    private wordlistGenerator: WordlistGeneratorService
  ) {}

  ngOnInit() {
    if (this.charsetForm === undefined) {
      this.generateForm();
    }
  }

  get charsets() {
    return this.charsetForm.get('charsets') as FormArray;
  }

  addCharset() {
    this.charsets.push(this.formBuilder.control('', Validators.required));
  }

  generateForm() {
    this.charsetForm = this.formBuilder.group({
      charsets: this.formBuilder.array([
        this.formBuilder.control('', Validators.required)
      ])
    });
  }

  generateWordlist() {
    if (this.charsets.valid) {
      this.wordlist$ = this.wordlistGenerator.generateWordlist(
        ...this.charsets.value
      );
    }
  }
}
