import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CFDisplayDataComponent } from './cf-display-data.component';

describe('CFDisplayDataComponent', () => {
  let component: CFDisplayDataComponent;
  let fixture: ComponentFixture<CFDisplayDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CFDisplayDataComponent],
    });
    fixture = TestBed.createComponent(CFDisplayDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
