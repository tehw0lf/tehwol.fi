import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { delay, of } from 'rxjs';

import { FileType } from './filetypes';
import { WordlistGeneratorComponent } from './wordlist-generator.component';
import { WordlistGeneratorService } from './wordlist-generator.service';

const wordlistGeneratorServiceMock = {
  generateWordlist: jest.fn(() => {
    return of('123').pipe(delay(10));
  })
};

const plaintextSample = '13\n23\n14\n24';
const xmlSample =
  '<wordlist><word>13</word><word>23</word><word>14</word><word>24</word></wordlist>';

describe('WordlistGeneratorComponent', () => {
  let component: WordlistGeneratorComponent;
  let fixture: ComponentFixture<WordlistGeneratorComponent>;

  global.URL.createObjectURL = jest.fn(() => '');
  global.window.URL.revokeObjectURL = jest.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule, // eslint-disable-line @typescript-eslint/no-deprecated
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        WordlistGeneratorComponent
      ],
      providers: [
        {
          provide: WordlistGeneratorService,
          useValue: wordlistGeneratorServiceMock
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WordlistGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have generated a form', () => {
    expect(component.charsets?.length).toBe(1);
  });

  it('should add a charset', () => {
    component.addCharset();
    expect(component.charsets?.length).toBe(2);
  });

  it('should clone a charset at the correct position', () => {
    component.addCharset();
    component.addCharset();
    component.charsets?.at(1).setValue('abc');
    component.cloneCharset(1);
    expect(component.charsets?.at(1).value).toEqual(
      component.charsets?.at(2).value
    );
  });

  it('should remove a charset if there is more than one', () => {
    component.addCharset();
    component.removeCharset(0);
    expect(component.charsets?.length).toBe(1);
  });

  it('should not remove a charset if there is just one', () => {
    component.removeCharset(0);
    expect(component.charsets?.length).toBe(1);
  });

  it('should filter duplicates from the charsets', () => {
    component.charsets?.at(0).setValue('1233');
    component.generateWordlist();

    expect(wordlistGeneratorServiceMock.generateWordlist).toHaveBeenCalledWith(
      '123'
    );
  });

  it('should provide a downloadable file for non IE browsers', (done) => {
    const before = document.body.innerHTML;
    component.charsets?.at(0).setValue('123');
    component.generateWordlist();

    setTimeout(() => {
      component.downloadWordlist();
      const after = document.body.innerHTML;
      expect(before).not.toEqual(after);
      expect(after).toContain('download="wordlist_3_words_1_positions.txt"');
      done();
    }, 10);
  });

  it('should provide a downloadable file for IE', (done) => {
    component.charsets?.at(0).setValue('123');
    component.generateWordlist();
    const nav: Navigator & { msSaveOrOpenBlob?: jest.Mock } =
      Object.defineProperty(global.window.navigator, 'msSaveOrOpenBlob', {
        value: jest.fn(),
        configurable: true
      });

    setTimeout(() => {
      component.downloadWordlist();
      setTimeout(() => {
        expect(nav.msSaveOrOpenBlob).toHaveBeenCalledTimes(1);
        Object.defineProperty(global.window.navigator, 'msSaveOrOpenBlob', {
          value: undefined
        });
        done();
      }, 10);
    }, 20);
  });

  it('should prepend the prefix', (done) => {
    component.charsetForm?.get('prefix')?.setValue('abc');
    component.charsets?.at(0).setValue('123');
    component.generateWordlist();

    component['getWordlist']().subscribe({
      next: (wordlist: string) => {
        expect(wordlist).toEqual('abc123\n');
      },
      complete: () => done()
    });
  });

  it('should append the suffix', (done) => {
    component.charsetForm?.get('suffix')?.setValue('xyz');
    component.charsets?.at(0).setValue('123');
    component.generateWordlist();

    component['getWordlist']().subscribe({
      next: (wordlist: string) => {
        expect(wordlist).toEqual('123xyz\n');
      },
      complete: () => done()
    });
  });

  it('should parse a wordlist to plain text', () => {
    component.fileType.set(FileType.plaintext);
    const result = component.parseWordlist('13\n23\n14\n24');

    expect(JSON.stringify(result.wordlist)).toEqual(
      JSON.stringify(plaintextSample)
    );
    expect(result.contentType).toEqual('text/plain');
  });

  it('should parse a wordlist to XML', () => {
    component.fileType.set(FileType.xml);
    const result = component.parseWordlist('13\n23\n14\n24');

    expect(result.wordlist).toEqual(xmlSample);
    expect(result.contentType).toEqual('text/xml');
  });

  it('should do nothing if the charset is not valid', () => {
    component.generateWordlist();
    expect(component.wordlist()).toEqual('');
  });

  describe('Large dataset handling', () => {
    it('should detect large datasets correctly', () => {
      // Set up a large dataset scenario - create unique characters using Unicode range
      const largeCharset1 = Array.from({ length: 300 }, (_, i) =>
        String.fromCharCode(33 + i)
      ).join(''); // 300 unique chars starting from '!'
      const largeCharset2 = Array.from({ length: 300 }, (_, i) =>
        String.fromCharCode(333 + i)
      ).join(''); // 300 unique chars starting from Unicode 333

      component.charsets?.at(0).setValue(largeCharset1);
      component.addCharset();
      component.charsets?.at(1).setValue(largeCharset2);

      component.generateWordlist();

      expect(component.isLargeDataset()).toBe(true);
      expect(component.wordsGenerated()).toBe(90000); // 300 * 300
    });

    it('should detect small datasets correctly', () => {
      component.charsets?.at(0).setValue('abc'); // 3 characters
      component.addCharset();
      component.charsets?.at(1).setValue('123'); // 3 characters

      component.generateWordlist();

      expect(component.isLargeDataset()).toBe(false);
      expect(component.wordsGenerated()).toBe(9); // 3 * 3
    });

    it('should set generation state correctly', (done) => {
      component.charsets?.at(0).setValue('abc');

      expect(component.isGenerating()).toBe(false);

      component.generateWordlist();

      expect(component.isGenerating()).toBe(true);

      // Wait for observable to complete
      setTimeout(() => {
        expect(component.isGenerating()).toBe(false);
        done();
      }, 20);
    });

    it('should control wordlist display based on size', () => {
      // Small dataset - should display
      component.charsets?.at(0).setValue('ab');
      component.addCharset();
      component.charsets?.at(1).setValue('12');

      component.generateWordlist();

      expect(component.displayWordlist()).toBe(true);
      expect(component.wordsGenerated()).toBe(4);

      // Large dataset - should not display (need > 100 words)
      const charset1 = Array.from({ length: 15 }, (_, i) =>
        String.fromCharCode(65 + i)
      ).join(''); // 15 unique chars A-O
      const charset2 = Array.from({ length: 10 }, (_, i) =>
        String.fromCharCode(48 + i)
      ).join(''); // 10 unique chars 0-9

      component.charsets?.at(0).setValue(charset1);
      component.charsets?.at(1).setValue(charset2);

      component.generateWordlist();

      expect(component.displayWordlist()).toBe(false);
      expect(component.wordsGenerated()).toBe(150); // 15 * 10
    });
  });

  describe('Progress tracking', () => {
    it('should reset generation state when wordlist generation completes', (done) => {
      component.charsets?.at(0).setValue('abc');
      component.generateWordlist();

      expect(component.isGenerating()).toBe(true);

      // Wait for the observable to complete
      setTimeout(() => {
        expect(component.isGenerating()).toBe(false);
        done();
      }, 20);
    });
  });

  describe('Performance optimization', () => {
    it('should only regenerate wordlist when charsets change', () => {
      component.charsets?.at(0).setValue('abc');
      component.generateWordlist();

      // Mock that the filtered charset hasn't changed
      expect(component.filteredCharset()).toBeDefined();

      // Call downloadWordlist which should not regenerate
      jest.spyOn(component, 'generateWordlist');
      component.downloadWordlist();

      expect(component.generateWordlist).not.toHaveBeenCalled();
    });

    it('should regenerate wordlist when charsets actually change', () => {
      component.charsets?.at(0).setValue('abc');
      component.generateWordlist();

      // Change the charset
      component.charsets?.at(0).setValue('def');

      jest.spyOn(component, 'generateWordlist');
      component.downloadWordlist();

      expect(component.generateWordlist).toHaveBeenCalled();
    });
  });
});
