import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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

  cloneCharset(index: number) {
    const charset = this.charsets.value[index];
    this.charsets.insert(
      index,
      this.formBuilder.control(charset, Validators.required)
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.charsets.controls,
      event.previousIndex,
      event.currentIndex
    );
    this.charsets.updateValueAndValidity();
  }

  downloadDialog(): void {
    const filename = 'word.lst';
    this.downloadWordlist(filename);
  }

  downloadWordlist(filename: string) {
    if (this.wordlist) {
      const parsed = this.wordlist.toString().replace(/,/g, '\n');
      const file = new Blob([parsed], { type: 'text/plain' });
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, filename);
      } else {
        const a = document.createElement('a');
        const url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        console.log(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      }
    }
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
      this.wordlist = [];
      const filteredCharset = [];
      this.charsets.value.map((charset: string) =>
        filteredCharset.push(this.removeDuplicates(charset))
      );
      this.wordlistGenerator
        .generateWordlist(...filteredCharset)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((wordlist) => {
          for (const word of wordlist) {
            this.wordlist.push(word.join(''));
          }
        });
    }
  }

  removeCharset(i) {
    this.charsets.removeAt(i);
  }

  removeDuplicates = (unfiltered) => [...new Set(unfiltered)].join('');
}
