import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WordlistGeneratorService } from './wordlist-generator.service';

@Component({
  selector: 'app-wordlist-generator',
  templateUrl: './wordlist-generator.component.html',
  styleUrls: ['./wordlist-generator.component.scss']
})
export class WordlistGeneratorComponent implements OnInit, OnDestroy {
  wordlist: string[];
  charsetForm: FormGroup;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private wordlistGenerator: WordlistGeneratorService
  ) {}

  ngOnInit() {
    if (this.charsetForm === undefined) {
      this.generateForm();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
      // TODO: Filter duplicates from charsets
      this.wordlist = [];
      this.wordlistGenerator
        .generateWordlist(...this.charsets.value)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((wordlist) => {
          for (const word of wordlist) {
            this.wordlist.push(word.join(''));
          }
        });
    }
  }
}
