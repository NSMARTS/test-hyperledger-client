import { TestBed } from '@angular/core/testing';

import { EditInfoService } from './edit-info.service';

describe('EditInfoService', () => {
  let service: EditInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
