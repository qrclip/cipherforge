import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncodePasswordSettingsComponent } from './encode-password-settings.component';
import { EncodeModule } from '../../encode.module';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MockedDynamicDialogConfig, MockedDynamicDialogRef } from '../../../shared/_mocks/mocks';

describe('EncodePasswordSettingsComponent', () => {
  let component: EncodePasswordSettingsComponent;
  let fixture: ComponentFixture<EncodePasswordSettingsComponent>;
  let mockedDynamicDialogRef: MockedDynamicDialogRef;
  let mockedDynamicDialogConfig: MockedDynamicDialogConfig;

  beforeEach(() => {
    mockedDynamicDialogRef = new MockedDynamicDialogRef();
    mockedDynamicDialogConfig = new MockedDynamicDialogConfig();

    TestBed.configureTestingModule({
      imports: [EncodeModule],
      declarations: [EncodePasswordSettingsComponent],

      providers: [
        { provide: DynamicDialogRef, useValue: mockedDynamicDialogRef },
        { provide: DynamicDialogConfig, useValue: mockedDynamicDialogConfig },
      ],
    });
    fixture = TestBed.createComponent(EncodePasswordSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided level', () => {
    const testLevel = { ops: 10, mem: 15 };
    mockedDynamicDialogConfig.data = { level: testLevel };

    fixture = TestBed.createComponent(EncodePasswordSettingsComponent);
    component = fixture.componentInstance;

    expect(component.mCipherforgePassLevel).toEqual(testLevel);
  });

  it('Minimum Template', async () => {
    component.mSelectedTemplate = { name: 'Minimum', code: '1' };
    await component.onTemplateChanged();

    expect(component.mCipherforgePassLevel).toEqual({
      ops: 3,
      mem: 3
    });
  });


  it('Medium Template', async () => {
    component.mSelectedTemplate = { name: 'Medium', code: '2' };
    await component.onTemplateChanged();

    expect(component.mCipherforgePassLevel).toEqual({
      ops: 4,
      mem: 10
    });
  });

  it('High Template', async () => {
    component.mSelectedTemplate = { name: 'High', code: '3' };
    await component.onTemplateChanged();

    expect(component.mCipherforgePassLevel).toEqual({
      ops: 20,
      mem: 10
    });
  });

  it('Ultra Template', async () => {
    component.mSelectedTemplate = { name: 'Ultra', code: '4' };
    await component.onTemplateChanged();

    expect(component.mCipherforgePassLevel).toEqual({
      ops: 40,
      mem: 20
    });
  });

  it('should close with current level on OK', async () => {
    component.mCipherforgePassLevel = { ops: 5, mem: 8 };
    await component.onOK();

    expect(mockedDynamicDialogRef.close).toHaveBeenCalledWith({
      level: { ops: 5, mem: 8 }
    });
  });
});
