import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EmailApiService } from './email-api.service';

describe('EmailApiService', () => {
  let service: EmailApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(EmailApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
