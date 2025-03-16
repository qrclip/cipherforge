import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayEncodedComponent } from './display-encoded.component';
import { EncodeModule } from '../../encode.module';
import { MessageService } from 'primeng/api';
import { CFCoreEncodeService } from '../../../cf-core/services/cf-core-encode.service';

describe('DisplayEncodedComponent', () => {
  let component: DisplayEncodedComponent;
  let fixture: ComponentFixture<DisplayEncodedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EncodeModule],
      declarations: [DisplayEncodedComponent],
      providers: [MessageService, CFCoreEncodeService],
    });
    fixture = TestBed.createComponent(DisplayEncodedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
