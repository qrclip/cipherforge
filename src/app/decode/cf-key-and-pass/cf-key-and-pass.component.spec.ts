/* eslint-disable */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CFKeyAndPassComponent } from './cf-key-and-pass.component';
import { DecodeModule } from '../decode.module';
import { MessageService } from 'primeng/api';
import { CipherforgeMode } from '../../cf-core/cipherforge.types';
import { MockedCFToastService } from '../../shared/_mocks/mocks';
import { CFToastService } from '../../shared/cf-toast/cf-toast.service';

describe('CFKeyAndPassComponent', () => {
  let component: CFKeyAndPassComponent;
  let fixture: ComponentFixture<CFKeyAndPassComponent>;
  let mockedMockedCFToastService: MockedCFToastService;

  beforeEach(() => {
    mockedMockedCFToastService = new MockedCFToastService();

    TestBed.configureTestingModule({
      imports: [DecodeModule],
      providers: [MessageService, { provide: CFToastService, useValue: mockedMockedCFToastService }],
      declarations: [CFKeyAndPassComponent],
    });
    fixture = TestBed.createComponent(CFKeyAndPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('check password ok', () => {
    // @ts-ignore
    spyOn(component.mCFToastService, 'showError').and.callThrough();
    spyOn(component.eOpen, 'next').and.callThrough();
    component.mCipherforgeMode = CipherforgeMode.PASSWORD_ONLY;
    component.mPassword = 'MyPassword';
    component.onOpen();
    // @ts-ignore
    expect(component.mCFToastService.showError).not.toHaveBeenCalled();
    expect(component.eOpen.next).toHaveBeenCalled();
  });

  it('check password not ok', () => {
    // @ts-ignore
    spyOn(component.mCFToastService, 'showError').and.callThrough();
    spyOn(component.eOpen, 'next').and.callThrough();
    component.mCipherforgeMode = CipherforgeMode.PASSWORD_ONLY;
    component.mPassword = '';
    component.onOpen();
    // @ts-ignore
    expect(component.mCFToastService.showError).toHaveBeenCalled();
    expect(component.eOpen.next).not.toHaveBeenCalled();
  });

  it('check key ok', () => {
    // @ts-ignore
    spyOn(component.mCFToastService, 'showError').and.callThrough();
    spyOn(component.eOpen, 'next').and.callThrough();
    component.mCipherforgeMode = CipherforgeMode.KEY;
    component.mKey = 'MyKey';
    component.onOpen();
    // @ts-ignore
    expect(component.mCFToastService.showError).not.toHaveBeenCalled();
    expect(component.eOpen.next).toHaveBeenCalled();
  });

  it('check key not ok', () => {
    // @ts-ignore
    spyOn(component.mCFToastService, 'showError').and.callThrough();
    spyOn(component.eOpen, 'next').and.callThrough();
    component.mCipherforgeMode = CipherforgeMode.KEY;
    component.mKey = '';
    component.onOpen();
    // @ts-ignore
    expect(component.mCFToastService.showError).toHaveBeenCalled();
    expect(component.eOpen.next).not.toHaveBeenCalled();
  });

  it('check key and pass ok', () => {
    // @ts-ignore
    spyOn(component.mCFToastService, 'showError').and.callThrough();
    spyOn(component.eOpen, 'next').and.callThrough();
    component.mCipherforgeMode = CipherforgeMode.KEY_AND_PASSWORD;
    component.mKey = 'MyKey';
    component.mPassword = 'MyPass';
    component.onOpen();
    // @ts-ignore
    expect(component.mCFToastService.showError).not.toHaveBeenCalled();
    expect(component.eOpen.next).toHaveBeenCalled();
  });

  it('check key and pass not ok(key)', () => {
    // @ts-ignore
    spyOn(component.mCFToastService, 'showError').and.callThrough();
    spyOn(component.eOpen, 'next').and.callThrough();
    component.mCipherforgeMode = CipherforgeMode.KEY_AND_PASSWORD;
    component.mKey = '';
    component.mPassword = 'MyPass';
    component.onOpen();
    // @ts-ignore
    expect(component.mCFToastService.showError).toHaveBeenCalled();
    expect(component.eOpen.next).not.toHaveBeenCalled();
  });

  it('check key and pass not ok(pass)', () => {
    // @ts-ignore
    spyOn(component.mCFToastService, 'showError').and.callThrough();
    spyOn(component.eOpen, 'next').and.callThrough();
    component.mCipherforgeMode = CipherforgeMode.KEY_AND_PASSWORD;
    component.mKey = 'MyKey';
    component.mPassword = '';
    component.onOpen();
    // @ts-ignore
    expect(component.mCFToastService.showError).toHaveBeenCalled();
    expect(component.eOpen.next).not.toHaveBeenCalled();
  });

  it('check key and pass not ok(pass and key)', () => {
    // @ts-ignore
    spyOn(component.mCFToastService, 'showError').and.callThrough();
    spyOn(component.eOpen, 'next').and.callThrough();
    component.mCipherforgeMode = CipherforgeMode.KEY_AND_PASSWORD;
    component.mKey = '';
    component.mPassword = '';
    component.onOpen();
    // @ts-ignore
    expect(component.mCFToastService.showError).toHaveBeenCalled();
    expect(component.eOpen.next).not.toHaveBeenCalled();
  });
});
