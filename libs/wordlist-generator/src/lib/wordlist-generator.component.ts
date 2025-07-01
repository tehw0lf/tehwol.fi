import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  signal,
  ViewEncapsulation
} from '@angular/core';
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
import { finalize, reduce, shareReplay, takeUntil } from 'rxjs/operators';

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
    MatProgressBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordlistGeneratorComponent implements OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);
  private wordlistGenerator = inject(WordlistGeneratorService);

  buttonStyle = input({
    'background-color': '#333333',
    color: '#cc7832'
  });

  dragStyle = input({ color: '#cc7832' });
  textStyle = input({ color: '#cc7832' });

  charsetForm: UntypedFormGroup | undefined;
  wordlist = signal<string>('');

  displayWordlist = signal(false);
  fileType = signal(FileType.plaintext);
  fileTypes = Object.values(FileType);
  filteredCharset = signal<string[]>([]);
  prefix = signal('');
  suffix = signal('');
  isGenerating = signal(false);
  isLargeDataset = signal(false);
  wordsGenerated = signal<number | undefined>(undefined);

  canGenerate = computed(
    () => this.charsetForm?.valid && this.filteredCharset().length > 0
  );

  hasWordlist = computed(() => this.wordlist().length > 0);

  private unsubscribe$ = new Subject<void>();

  constructor() {
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
      const currentCharset = this.filterCharset(this.charsets.value);
      if (
        JSON.stringify(this.filteredCharset()) !==
        JSON.stringify(currentCharset)
      ) {
        this.generateWordlist();
      }
      const filename = `wordlist_${this.wordsGenerated()}_words_${this.charsets.length}_positions.${this.fileType()}`;
      const wordlistContent = this.wordlist();

      if (wordlistContent && wordlistContent.length > 0) {
        this.performDownload(wordlistContent, filename);
      }
    }
  }

  private performDownload(wordlistContent: string, filename: string): void {
    const parsed = this.parseWordlist(wordlistContent);
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
      this.filteredCharset.set(this.filterCharset(this.charsets.value));
      this.prefix.set(this.charsetForm.get('prefix')?.value || '');
      this.suffix.set(this.charsetForm.get('suffix')?.value || '');

      const wordsCount = this.filteredCharset()
        .map((charset: string) => charset.length)
        .reduce(
          (previousLength: number, currentLength: number) =>
            previousLength * currentLength
        );

      this.wordsGenerated.set(wordsCount);
      this.isLargeDataset.set(wordsCount > 50000);
      this.displayWordlist.set(wordsCount <= 100);
      this.isGenerating.set(true);

      // Generate wordlist and update signal
      this.getWordlist()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (wordlist) => this.wordlist.set(wordlist),
          error: (error) => {
            console.error('Error generating wordlist:', error);
            this.isGenerating.set(false);
          }
        });
    }
  }

  private getWordlist(): Observable<string> {
    return this.wordlistGenerator
      .generateWordlist(...this.filteredCharset())
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
        reduce(
          (wordlist: string, word: string) =>
            `${wordlist}${this.prefix()}${word}${this.suffix()}\n`,
          ''
        ),
        finalize(() => {
          this.isGenerating.set(false);
        }),
        takeUntil(this.unsubscribe$)
      );
  }

  filterCharset(charsets: string[]): string[] {
    return charsets.map((charset: string) => this.removeDuplicates(charset));
  }

  parseWordlist(wordlist: string): { wordlist: string; contentType: string } {
    switch (this.fileType()) {
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
