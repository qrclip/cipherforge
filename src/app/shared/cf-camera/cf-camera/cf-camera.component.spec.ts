import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CfCameraComponent } from './cf-camera.component';
import { CFCameraModule } from '../cf-camera.module';

describe('CfCameraComponent', () => {
  let component: CfCameraComponent;
  let fixture: ComponentFixture<CfCameraComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CFCameraModule],
      declarations: [CfCameraComponent],
    });
    fixture = TestBed.createComponent(CfCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
