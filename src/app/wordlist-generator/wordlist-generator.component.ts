import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, reduce, takeUntil } from 'rxjs/operators';

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
  wordlist: string;
  wordlist$: Observable<string>;

  fileType = FileType.PLAINTEXT;
  fileTypes = Object.values(FileType);

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
    if (this.wordlist) {
      const filename = `wordlist_${this.charsets.length}_positions.${this.fileType}`;
      const parsed = this.parseWordlist();
      const file = new Blob([parsed.wordlist], { type: parsed.contentType });
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
      this.wordlist = '';
      const filteredCharset: string[] = [];
      const prefix = this.charsetForm.get('prefix').value;
      const suffix = this.charsetForm.get('suffix').value;
      this.charsets.value.map((charset: string) =>
        filteredCharset.push(this.removeDuplicates(charset))
      );
      this.wordlistGenerator
        .generateWordlist(...filteredCharset)
        .pipe(
          map((word: string) => `${prefix}${word}${suffix}`),
          reduce((wordlist: string, word: string) => `${wordlist}\n${word}`),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((wordlist: string) => {
          this.wordlist = wordlist;
        });
    }
  }

  parseWordlist(): { wordlist: string; contentType: string } {
    switch (this.fileType) {
      case FileType.PLAINTEXT:
        return toPlaintext(this.wordlist);
      case FileType.XML:
        return toXML(this.wordlist);
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
