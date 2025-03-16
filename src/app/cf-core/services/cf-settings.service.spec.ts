/* eslint-disable */

import { TestBed } from '@angular/core/testing';

import { CFSettingsService } from './cf-settings.service';
import {
  CF_DEFAULT_PASS_LEVEL_MEM,
  CF_DEFAULT_PASS_LEVEL_OPS,
} from '../cipherforge.types';

describe('CFSettingsService', () => {
  let service: CFSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CFSettingsService);
  });

  //////////////////////////////////////////////////////////
  // SHOULD BE CREATED
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //////////////////////////////////////////////////////////
  // CHECK CONSTRUCTION VARIABLE INIT
  it('check construction variables init', () => {
    expect(service).toBeTruthy();

    // @ts-ignore
    expect(service.mLoaded).toEqual(false);

    // @ts-ignore
    expect(service.mCFSettingsPassword).toEqual({
      ops: CF_DEFAULT_PASS_LEVEL_OPS,
      mem: CF_DEFAULT_PASS_LEVEL_MEM,
    });

    // @ts-ignore
    expect(service.mCFQRCodeEncodingOption).toEqual({
      version: '20',
      errorCorrection: 'H',
    });

    // @ts-ignore
    expect(service.mQRCodeScale).toEqual(3);

    // @ts-ignore
    expect(service.mCFPDFSettings).toEqual(null);
  });

  //////////////////////////////////////////////////////////
  // LOAD SETTINGS ONLY ONE
  it('load settings only once', () => {
    // @ts-ignore
    expect(service.mLoaded).toEqual(false);

    // @ts-ignore
    spyOn(service, 'loadQRCodeScale').and.callFake(() => {
      return Promise.resolve();
    });

    // @ts-ignore
    service.loadSettings();

    // @ts-ignore
    expect(service.loadQRCodeScale).toHaveBeenCalled();

    // @ts-ignore
    expect(service.mLoaded).toEqual(true);

    // @ts-ignore
    service.loadSettings();

    // @ts-ignore
    expect(service.loadQRCodeScale).toHaveBeenCalledOnceWith();
  });

  //////////////////////////////////////////////////////////
  // SAVE AND RETRIEVE SETTINGS
  it('save and retrieve settings', async () => {
    await service.clearSettings();

    await service.setPasswordSettings({
      ops: 10,
      mem: 11,
    });

    const tSetPass = await service.getPasswordSettings();
    expect(tSetPass.ops).toEqual(10);
    expect(tSetPass.mem).toEqual(11);

    let tSetPDF = await service.getPDFSettings();
    expect(tSetPDF).toEqual(null);

    await service.setPDFSettings({
      unit: 'cm',
      pageWidth: 101,
      pageHeight: 102,
      QRCodeSize: 103,
      minMargin: 104,
    });

    tSetPDF = await service.getPDFSettings();
    expect(tSetPDF!.unit).toEqual('cm');
    expect(tSetPDF!.pageWidth).toEqual(101);
    expect(tSetPDF!.pageHeight).toEqual(102);
    expect(tSetPDF!.QRCodeSize).toEqual(103);
    expect(tSetPDF!.minMargin).toEqual(104);

    await service.setQRCodeEncodingOptions({
      version: '30',
      errorCorrection: 'Q',
    });

    // TO MAKE SURE LOAD PDF SETTINGS LOADS THE INFORMATION FROM LOCAL STORAGE ( COVERAGE )
    // @ts-ignore
    service.mCFPDFSettings.pageWidth = 234;

    // @ts-ignore
    await service.loadPDFSettings();

    tSetPDF = await service.getPDFSettings();
    expect(tSetPDF!.pageWidth).toEqual(101);

    const tSetQR = await service.getQRCodeEncodingOptions();
    expect(tSetQR.version).toEqual('30');
    expect(tSetQR.errorCorrection).toEqual('Q');

    await service.setQRCodeScale(7);
    const tSetQRScale = await service.getQRCodeScale();
    expect(tSetQRScale).toEqual(7);
  });
});
