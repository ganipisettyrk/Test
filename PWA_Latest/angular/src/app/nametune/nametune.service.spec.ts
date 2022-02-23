import { TestBed } from '@angular/core/testing';

import { NametuneService } from './nametune.service';

describe('NametuneService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NametuneService = TestBed.get(NametuneService);
    expect(service).toBeTruthy();
  });
});
