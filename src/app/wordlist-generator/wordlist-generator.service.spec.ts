import { TestBed } from '@angular/core/testing';

import { WordlistGeneratorService } from './wordlist-generator.service';

const actualWordlist = [
  ['0', '3', '7'],
  ['1', '3', '7'],
  ['2', '3', '7'],
  ['0', '4', '7'],
  ['1', '4', '7'],
  ['2', '4', '7'],
  ['0', '5', '7'],
  ['1', '5', '7'],
  ['2', '5', '7'],
  ['0', '3', '8'],
  ['1', '3', '8'],
  ['2', '3', '8'],
  ['0', '4', '8'],
  ['1', '4', '8'],
  ['2', '4', '8'],
  ['0', '5', '8'],
  ['1', '5', '8'],
  ['2', '5', '8'],
  ['0', '3', '9'],
  ['1', '3', '9'],
  ['2', '3', '9'],
  ['0', '4', '9'],
  ['1', '4', '9'],
  ['2', '4', '9'],
  ['0', '5', '9'],
  ['1', '5', '9'],
  ['2', '5', '9']
];

describe('WordlistGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WordlistGeneratorService = TestBed.get(
      WordlistGeneratorService
    );
    expect(service).toBeTruthy();
  });

  it('should create a wordlist', () => {
    const expectedWordlist = [];
    const service: WordlistGeneratorService = TestBed.get(
      WordlistGeneratorService
    );
    const charset1 = '012';
    const charset2 = '345';
    const charset3 = '789';
    service
      .generateWordlist(charset1, charset2, charset3)
      .subscribe((wordlist) => {
        for (const word of wordlist) {
          expectedWordlist.push(word);
        }
      });
    expect(actualWordlist).toEqual(expectedWordlist);
  });
});
