import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CFShareKeyDialogComponent } from './cf-share-key-dialog.component';
import { CFShareKeyModule } from '../cf-share-key.module';
import { MockedDynamicDialogConfig } from '../../_mocks/mocks';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

describe('CFShareKeyDialogComponent', () => {
  let component: CFShareKeyDialogComponent;
  let fixture: ComponentFixture<CFShareKeyDialogComponent>;
  let mockedDynamicDialogConfig: MockedDynamicDialogConfig;

  beforeEach(() => {
    mockedDynamicDialogConfig = new MockedDynamicDialogConfig();
    TestBed.configureTestingModule({
      imports: [CFShareKeyModule],
      declarations: [CFShareKeyDialogComponent],
      providers: [{ provide: DynamicDialogConfig, useValue: mockedDynamicDialogConfig }],
    });
    fixture = TestBed.createComponent(CFShareKeyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
