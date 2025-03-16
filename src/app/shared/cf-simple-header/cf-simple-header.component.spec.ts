import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CFSimpleHeaderComponent } from './cf-simple-header.component';

describe('CFSimpleHeaderComponent', () => {
  let component: CFSimpleHeaderComponent;
  let fixture: ComponentFixture<CFSimpleHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CFSimpleHeaderComponent],
    });
    fixture = TestBed.createComponent(CFSimpleHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
