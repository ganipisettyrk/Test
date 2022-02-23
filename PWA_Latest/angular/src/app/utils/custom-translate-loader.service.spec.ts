import { TestBed } from '@angular/core/testing';

import { CustomTranslateLoaderService } from './custom-translate-loader.service';

describe('CustomTranslateLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomTranslateLoaderService = TestBed.get(CustomTranslateLoaderService);
    expect(service).toBeTruthy();
  });
});
