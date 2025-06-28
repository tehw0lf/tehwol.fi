import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { AsyncPipe, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, Subject } from 'rxjs';
import { reduce, takeUntil, finalize } from 'rxjs/operators';

import { FileType } from './filetypes';
import { toCSV, toPlaintext, toXML } from './parsers';
import { WordlistGeneratorService } from './wordlist-generator.service';

/* eslint-disable @angular-eslint/component-selector */
@Component({
    selector: 'wordlist-generator',
    templateUrl: './wordlist-generator.component.html',
    styleUrls: ['./wordlist-generator.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatButtonModule,
        NgStyle,
        MatMenuModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        CdkDropList,
        CdkDrag,
        MatIconModule,
        MatProgressBarModule,
        AsyncPipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordlistGeneratorComponent implements OnInit, OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);
  private wordlistGenerator = inject(WordlistGeneratorService);

  buttonStyle = input({
    'background-color': '#333333',
    color: '#cc7832'
  });

  dragStyle = input({ color: '#cc7832' });
  textStyle = input({ color: '#cc7832' });

  charsetForm: UntypedFormGroup | undefined;
  wordsGenerated: number | undefined;
  wordlist$: Observable<string> | undefined;

  displayWordlist = false;
  fileType = FileType.plaintext;
  fileTypes = Object.values(FileType);
  filteredCharset: string[] = [];
  prefix = '';
  suffix = '';
  isGenerating = false;
  isLargeDataset = false;

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.generateForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get charsets(): UntypedFormArray | undefined {
    if (this.charsetForm) {
      return this.charsetForm.get('charsets') as UntypedFormArray;
    }
    return undefined;
  }

  addCharset(): void {
    if (this.charsets) {
      this.charsets.push(this.formBuilder.control('', Validators.required));
    }
  }

  cloneCharset(index: number): void {
    if (this.charsets) {
      const charset = this.charsets.value[index];
      this.charsets.insert(
        index,
        this.formBuilder.control(charset, Validators.required)
      );
    }
  }

  downloadWordlist(): void {
    if (this.charsets) {
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if ((window.navigator as any).msSaveOrOpenBlob) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window.navigator as any).msSaveOrOpenBlob(file, filename);
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
  }

  drop(event: CdkDragDrop<string[]>): void {
    if (this.charsets) {
      moveItemInArray(
        this.charsets.controls,
        event.previousIndex,
        event.currentIndex
      );
      this.charsets.updateValueAndValidity();
    }
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
    if (this.charsetForm && this.charsets && this.charsets.valid) {
      this.filteredCharset = this.filterCharset(this.charsets.value);
      this.prefix = this.charsetForm.get('prefix')?.value
        ? this.charsetForm.get('prefix')?.value
        : '';
      this.suffix = this.charsetForm.get('suffix')?.value
        ? this.charsetForm.get('suffix')?.value
        : '';

      this.wordsGenerated = this.filteredCharset
        .map((charset: string) => charset.length)
        .reduce(
          (previousLength: number, currentLength: number) =>
            previousLength * currentLength
        );
      
      this.isLargeDataset = this.wordsGenerated > 50000;
      this.displayWordlist = this.wordsGenerated <= 100;
      this.isGenerating = true;
      
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
        finalize(() => {
          this.isGenerating = false;
        }),
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
      case FileType.csv:
        return toCSV(wordlist);
    }
  }

  removeCharset(i: number): void {
    if (this.charsets && this.charsets.length > 1) {
      this.charsets.removeAt(i);
    }
  }

  removeDuplicates = (unfiltered: string): string =>
    [...new Set(unfiltered)].join('');
}
