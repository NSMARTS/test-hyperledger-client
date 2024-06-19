import { TestBed } from '@angular/core/testing';

import { DrawStoreService } from './draw-store.service';

describe('DrawStoreService', () => {
  let service: DrawStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
