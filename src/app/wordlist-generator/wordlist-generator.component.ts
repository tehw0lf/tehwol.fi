import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { reduce, takeUntil, tap } from 'rxjs/operators';

import { FileType } from './filetypes';
import { toPlaintext, toXML } from './parsers';
import { WordlistGeneratorService } from './wordlist-generator.service';

@Component({
  selector: 'app-wordlist-generator',
  templateUrl: './wordlist-generator.component.html',
  styleUrls: ['./wordlist-generator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WordlistGeneratorComponent implements OnInit, OnDestroy {
  charsetForm: FormGroup;
  wordsGenerated: number;
  wordlist$: Observable<string>;

  displayWordlist = false;
  fileType = FileType.plaintext;
  fileTypes = Object.values(FileType);
  filteredCharset: string[] = [];
  prefix = '';
  suffix = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private wordlistGenerator: WordlistGeneratorService
  ) {}

  ngOnInit(): void {
    this.generateForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get charsets(): FormArray {
    return this.charsetForm.get('charsets') as FormArray;
  }

  addCharset(): void {
    this.charsets.push(this.formBuilder.control('', Validators.required));
  }

  cloneCharset(index: number): void {
    const charset = this.charsets.value[index];
    this.charsets.insert(
      index,
      this.formBuilder.control(charset, Validators.required)
    );
  }

  downloadWordlist(): void {
    if (this.filteredCharset !== this.filterCharset(this.charsets.value)) {
      this.generateWordlist();
    }
    const filename = `wordlist_${this.wordsGenerated}_words_${this.charsets.length}_positions.${this.fileType}`;
    this.getWordlist()
      .pipe(
        tap((wordlist: string) => {
          if (wordlist.length > 0) {
            const parsed = this.parseWordlist(wordlist);
            const file = new Blob([parsed.wordlist], {
              type: parsed.contentType
            });
            if (window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(file, filename);
            } else {
              const a = document.createElement('a');
              const url = URL.createObjectURL(file);
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }, 0);
            }
          }
        })
      )
      .subscribe();
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      this.charsets.controls,
      event.previousIndex,
      event.currentIndex
    );
    this.charsets.updateValueAndValidity();
  }

  generateForm(): void {
    this.charsetForm = this.formBuilder.group({
      charsets: this.formBuilder.array([
        this.formBuilder.control('', Validators.required)
      ]),
      prefix: this.formBuilder.control(''),
      suffix: this.formBuilder.control('')
    });
  }

  generateWordlist(): void {
    if (this.charsets.valid) {
      this.filteredCharset = this.filterCharset(this.charsets.value);
      this.prefix = this.charsetForm.get('prefix').value
        ? this.charsetForm.get('prefix').value
        : '';
      this.suffix = this.charsetForm.get('suffix').value
        ? this.charsetForm.get('suffix').value
        : '';

      this.wordsGenerated = this.filteredCharset
        .map((charset: string) => charset.length)
        .reduce(
          (previousLength: number, currentLength: number) =>
            previousLength * currentLength
        );
      this.displayWordlist = this.wordsGenerated <= 100;
      this.wordlist$ = this.getWordlist();
    }
  }

  getWordlist(): Observable<string> {
    return this.wordlistGenerator
      .generateWordlist(...this.filteredCharset)
      .pipe(
        reduce(
          (wordlist: string, word: string) =>
            `${wordlist}${this.prefix}${word}${this.suffix}\n`,
          ''
        ),
        takeUntil(this.unsubscribe$)
      );
  }

  filterCharset(charsets: string[]): string[] {
    return charsets.map((charset: string) => this.removeDuplicates(charset));
  }

  parseWordlist(wordlist: string): { wordlist: string; contentType: string } {
    switch (this.fileType) {
      case FileType.plaintext:
        return toPlaintext(wordlist);
      case FileType.xml:
        return toXML(wordlist);
    }
  }

  removeCharset(i: number): void {
    if (this.charsets.length > 1) {
      this.charsets.removeAt(i);
    }
  }

  removeDuplicates = (unfiltered: string): string =>
    [...new Set(unfiltered)].join('');
}
