import { TestBed } from '@angular/core/testing';

import { CFShareKeyService } from './cf-share-key.service';
import { CFShareKeyModule } from './cf-share-key.module';

describe('CFShareKeyService', () => {
  let service: CFShareKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CFShareKeyModule],
    });
    service = TestBed.inject(CFShareKeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
