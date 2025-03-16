import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CFTopMenuButtonComponent } from './cf-top-menu-button.component';

describe('CFTopMenuButtonComponent', () => {
  let component: CFTopMenuButtonComponent;
  let fixture: ComponentFixture<CFTopMenuButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CFTopMenuButtonComponent],
    });
    fixture = TestBed.createComponent(CFTopMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
