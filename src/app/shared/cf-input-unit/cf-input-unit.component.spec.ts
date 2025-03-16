/* eslint-disable */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CFInputUnitComponent } from './cf-input-unit.component';
import { CFInputUnitModule } from './cf-input-unit.module';

describe('CFInputUnitComponent', () => {
  let component: CFInputUnitComponent;
  let fixture: ComponentFixture<CFInputUnitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CFInputUnitModule],
      declarations: [CFInputUnitComponent],
    });
    fixture = TestBed.createComponent(CFInputUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('change unit', () => {
    component.sUnit = 'cm';
    expect(component.mUnit).toEqual('cm');
    component.sUnit = 'inches';
    expect(component.mUnit).toEqual('inches');
  });

  it('write value', () => {
    component.writeValue(72);
    expect(component.mValue).toEqual(72);
    expect(component.mValueCm).toEqual(2.539999999365);
    expect(component.mValueInches).toEqual(1);
  });

  it('test conversion from cm', () => {
    component.mValueCm = 10.0;
    component.onValueChanged('cm');
    expect(component.mValue).toEqual(10 * 28.3464567);
    expect(component.mValueCm).toEqual(10);
    expect(component.mValueInches).toEqual((10 * 28.3464567) / 72);
  });

  it('test conversion from inches', () => {
    component.mValueInches = 2;
    component.onValueChanged('inches');
    expect(component.mValue).toEqual(2 * 72);
    expect(component.mValueCm).toEqual(5.07999999873);
    expect(component.mValueInches).toEqual(2);
  });
});
