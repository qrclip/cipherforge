import { TestBed } from '@angular/core/testing';

import { CFCameraService } from './cf-camera.service';
import { CFCameraModule } from './cf-camera.module';

describe('CfCameraService', () => {
  let service: CFCameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CFCameraModule],
    });
    service = TestBed.inject(CFCameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
