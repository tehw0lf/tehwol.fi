import { TestBed } from '@angular/core/testing';

import { WordlistGeneratorService } from './wordlist-generator.service';

const actualWordlist = [
  '037',
  '137',
  '237',
  '047',
  '147',
  '247',
  '057',
  '157',
  '257',
  '038',
  '138',
  '238',
  '048',
  '148',
  '248',
  '058',
  '158',
  '258',
  '039',
  '139',
  '239',
  '049',
  '149',
  '249',
  '059',
  '159',
  '259'
];

describe('WordlistGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WordlistGeneratorService = TestBed.inject(
      WordlistGeneratorService
    );
    expect(service).toBeTruthy();
  });

  it('should create a wordlist', () => {
    const expectedWordlist = [];
    const service: WordlistGeneratorService = TestBed.inject(
      WordlistGeneratorService
    );
    const charset1 = '012';
    const charset2 = '345';
    const charset3 = '789';
    service.generateWordlist(charset1, charset2, charset3).subscribe((word) => {
      expectedWordlist.push(word);
    });
    expect(expectedWordlist).toEqual(actualWordlist);
  });
});
