import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayEncodedOptionsComponent } from './display-encoded-options.component';
import { EncodeModule } from '../../../encode.module';
import { MockedDynamicDialogConfig, MockedDynamicDialogRef } from '../../../../shared/_mocks/mocks';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

describe('DisplayEncodedOptionsComponent', () => {
  let component: DisplayEncodedOptionsComponent;
  let fixture: ComponentFixture<DisplayEncodedOptionsComponent>;
  let mockedDynamicDialogRef: MockedDynamicDialogRef;
  let mockedDynamicDialogConfig: MockedDynamicDialogConfig;

  beforeEach(() => {
    mockedDynamicDialogRef = new MockedDynamicDialogRef();
    mockedDynamicDialogConfig = new MockedDynamicDialogConfig();

    TestBed.configureTestingModule({
      imports: [EncodeModule],
      declarations: [DisplayEncodedOptionsComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: mockedDynamicDialogRef },
        { provide: DynamicDialogConfig, useValue: mockedDynamicDialogConfig },
      ],
    });
    fixture = TestBed.createComponent(DisplayEncodedOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values when no options provided', () => {
    expect(component.mSelectedVersion.code).toBe('10');
    expect(component.mSelectedErrorCorrection.code).toBe('L');
  });

  it('should initialize with provided options', () => {
    mockedDynamicDialogConfig.data = {
      options: {
        version: '20',
        errorCorrection: 'H'
      }
    };
    fixture = TestBed.createComponent(DisplayEncodedOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.mSelectedVersion.code).toBe('20');
    expect(component.mSelectedErrorCorrection.code).toBe('H');
  });

  it('should close dialog with selected values on OK', () => {
    component.mSelectedVersion = { name: '30', code: '30' };
    component.mSelectedErrorCorrection = { name: 'Level Q', code: 'Q' };

    component.onOK();

    expect(mockedDynamicDialogRef.close).toHaveBeenCalledWith({
      version: '30',
      errorCorrection: 'Q'
    });
  });
});
