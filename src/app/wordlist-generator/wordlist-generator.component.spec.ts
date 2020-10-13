import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { FileType } from './filetypes';
import { WordlistGeneratorComponent } from './wordlist-generator.component';
import { WordlistGeneratorService } from './wordlist-generator.service';

const wordlistGeneratorServiceMock = {
  generateWordlist: jest.fn(() => {
    return of('123');
  })
};

const plaintextSample = '13\n23\n14\n24';
const xmlSample =
  '<wordlist><word>13</word><word>23</word><word>14</word><word>24</word></wordlist>';

describe('WordlistGeneratorComponent', () => {
  let component: WordlistGeneratorComponent;
  let fixture: ComponentFixture<WordlistGeneratorComponent>;

  global.URL.createObjectURL = jest.fn();
  global.window.URL.revokeObjectURL = jest.fn();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WordlistGeneratorComponent],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule
      ],
      providers: [
        {
          provide: WordlistGeneratorService,
          useValue: wordlistGeneratorServiceMock
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordlistGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have generated a form', () => {
    expect(component.charsets.length).toBe(1);
  });

  it('should add a charset', () => {
    component.addCharset();
    expect(component.charsets.length).toBe(2);
  });

  it('should clone a charset at the correct position', () => {
    component.addCharset();
    component.addCharset();
    component.charsets.at(1).setValue('abc');
    component.cloneCharset(1);
    expect(component.charsets.at(1).value).toEqual(
      component.charsets.at(2).value
    );
  });

  it('should remove a charset if there is more than one', () => {
    component.addCharset();
    component.removeCharset(0);
    expect(component.charsets.length).toBe(1);
  });

  it('should not remove a charset if there is just one', () => {
    component.removeCharset(0);
    expect(component.charsets.length).toBe(1);
  });

  it('should filter duplicates from the charsets', () => {
    component.charsets.at(0).setValue('1233');
    component.generateWordlist();

    expect(wordlistGeneratorServiceMock.generateWordlist).toHaveBeenCalledWith(
      '123'
    );
  });

  it('should provide a downloadable file', () => {
    const before = document.body.innerHTML;
    component.downloadWordlist();
    const after = document.body.innerHTML;
    expect(before).not.toEqual(after);
  });

  it('should prepend the prefix', (done) => {
    component.charsetForm.get('prefix').setValue('abc');
    component.charsets.at(0).setValue('123');
    component.generateWordlist();

    component.getWordlist().subscribe({
      next: (wordlist: string) => {
        expect(wordlist).toEqual('abc123\n');
      },
      complete: () => done()
    });
  });

  it('should append the suffix', (done) => {
    component.charsetForm.get('suffix').setValue('xyz');
    component.charsets.at(0).setValue('123');
    component.generateWordlist();

    component.getWordlist().subscribe({
      next: (wordlist: string) => {
        expect(wordlist).toEqual('123xyz\n');
      },
      complete: () => done()
    });
  });

  it('should parse a wordlist to plain text', () => {
    component.fileType = FileType.PLAINTEXT;
    const result = component.parseWordlist('13\n23\n14\n24');

    expect(JSON.stringify(result.wordlist)).toEqual(
      JSON.stringify(plaintextSample)
    );
    expect(result.contentType).toEqual('text/plain');
  });

  it('should parse a wordlist to XML', () => {
    component.fileType = FileType.XML;
    const result = component.parseWordlist('13\n23\n14\n24');

    expect(result.wordlist).toEqual(xmlSample);
    expect(result.contentType).toEqual('text/xml');
  });

  it('should do nothing if the charset is not valid', () => {
    component.generateWordlist();
    expect(component.wordlist$).toBeUndefined();
  });
});
