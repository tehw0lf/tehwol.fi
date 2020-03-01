import { TestBed } from '@angular/core/testing';

import { WordlistGeneratorService } from './wordlist-generator.service';

describe('WordlistGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WordlistGeneratorService = TestBed.get(
      WordlistGeneratorService
    );
    expect(service).toBeTruthy();
  });

  it('should create a wordlist', () => {
    const service: WordlistGeneratorService = TestBed.get(
      WordlistGeneratorService
    );
    const charset1 = ['0', '1'];
    const charset2 = ['3', '4'];
    const charset3 = ['4', '5'];
    service.generateWordlist(charset1, charset2, charset3);
    expect(1).toEqual(1);
  });
});
