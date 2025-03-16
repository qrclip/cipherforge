import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CFCameraDialogComponent } from './cf-camera-dialog.component';
import { MockedDynamicDialogConfig, MockedDynamicDialogRef } from '../../_mocks/mocks';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CFCameraModule } from '../cf-camera.module';

describe('CFCameraDialogComponent', () => {
  let component: CFCameraDialogComponent;
  let fixture: ComponentFixture<CFCameraDialogComponent>;
  let mockedDynamicDialogRef: MockedDynamicDialogRef;
  let mockedDynamicDialogConfig: MockedDynamicDialogConfig;

  beforeEach(() => {
    mockedDynamicDialogRef = new MockedDynamicDialogRef();
    mockedDynamicDialogConfig = new MockedDynamicDialogConfig();

    TestBed.configureTestingModule({
      imports: [CFCameraModule],
      declarations: [CFCameraDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: mockedDynamicDialogRef },
        { provide: DynamicDialogConfig, useValue: mockedDynamicDialogConfig },
      ],
    });
    fixture = TestBed.createComponent(CFCameraDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
