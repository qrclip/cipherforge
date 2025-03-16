import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncodeComponent } from './encode.component';
import { EncodeModule } from './encode.module';
import { MessageService } from 'primeng/api';

describe('EncodeComponent', () => {
  let component: EncodeComponent;
  let fixture: ComponentFixture<EncodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EncodeModule],
      declarations: [EncodeComponent],
      providers: [MessageService],
    });
    fixture = TestBed.createComponent(EncodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
