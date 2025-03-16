/* eslint-disable */

import { TestBed } from '@angular/core/testing';

import { CFQRReadService } from './cf-qr-read.service';
import { CFQRCodeGenerator } from '../objects/cf-qrcode-generator';

describe('CFQRReadService', () => {
  let service: CFQRReadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CFQRReadService],
    });
    service = TestBed.inject(CFQRReadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('make sure terminate is called', () => {
    // @ts-ignore
    spyOn(service, 'terminate').and.callFake(() => {
      return Promise.resolve();
    });

    service.ngOnDestroy();

    // @ts-ignore
    expect(service.terminate).toHaveBeenCalled();
  });

  it('test qr code reading', async () => {
    const tCFQRCodeGenerator: CFQRCodeGenerator = new CFQRCodeGenerator();
    const tDataUrl = await tCFQRCodeGenerator.generateDataURL(new Uint8Array([123, 125, 132]), false, '10', 'L');

    const tDecodedData = await service.DecodeQRCodeFromImageData(tDataUrl);
    expect(tDecodedData.length).toEqual(3);
    expect(tDecodedData[0]).toEqual(123);
    expect(tDecodedData[1]).toEqual(125);
    expect(tDecodedData[2]).toEqual(132);
  });

  it('test qr code reading error ( valid image no qr code )', async () => {
    const tDecodedData = await service.DecodeQRCodeFromImageData(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAALklEQVR4nGL5N+MmAyr4/X4+mggTAxFgMCpibJYvRBMSnJw+sG6iniJAAAAA//9BRQcwWh4w7QAAAABJRU5ErkJggg=='
    );
    expect(tDecodedData.length).toEqual(0);
  });

  it('test qr code reading error ( no valid image data )', async () => {
    const tDecodedData = await service.DecodeQRCodeFromImageData('data:image/png;base64,iVBORw0KGZç');
    expect(tDecodedData.length).toEqual(0);
  });
});
