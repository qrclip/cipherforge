import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecodeComponent } from './decode.component';
import { DecodeModule } from './decode.module';
import { AppModule } from '../app.module';

describe('DecodeComponent', () => {
  let component: DecodeComponent;
  let fixture: ComponentFixture<DecodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DecodeModule, AppModule],
      declarations: [DecodeComponent],
    });
    fixture = TestBed.createComponent(DecodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
