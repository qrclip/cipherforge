/* eslint-disable */

import { CFQRCodeGenerator } from './cf-qrcode-generator';

describe('CFQRCodeGenerator', () => {
  ///////////////////////////////////////////////////////////////
  // DOWNLOAD QR CODE
  it('downloadQRCode', async () => {
    const tCFQRCodeGenerator = new CFQRCodeGenerator();
    // @ts-ignore
    spyOn(tCFQRCodeGenerator, 'download').and.callFake(() => {
      return Promise.resolve();
    });
    const tResult = await tCFQRCodeGenerator.downloadQRCode(new Uint8Array([32, 33]), 'image-file', false, '10', 'L');
    expect(tResult).toEqual(true);
    // @ts-ignore
    expect(tCFQRCodeGenerator.download).toHaveBeenCalled();
  });

  ///////////////////////////////////////////////////////////////
  // GenerateDataURL
  it('GenerateDataURL', async () => {
    const tCFQRCodeGenerator = new CFQRCodeGenerator();
    const tData = await tCFQRCodeGenerator.generateDataURL(new Uint8Array([32, 33]), false, '10', 'L');
    expect(tData.startsWith('data:image/png;base64,')).toEqual(true);
  });

  ///////////////////////////////////////////////////////////////
  // GenerateDataURL force version
  it('GenerateDataURL force version', async () => {
    const tCFQRCodeGenerator = new CFQRCodeGenerator();
    const tQRCodeDataVersion40 = await tCFQRCodeGenerator.generateDataURL(new Uint8Array([32, 33]), true, '40', 'L');

    const tQRCodeDataVersionMin = await tCFQRCodeGenerator.generateDataURL(new Uint8Array([32, 33]), false, '40', 'L');

    expect(tQRCodeDataVersion40.length).toBeGreaterThan(tQRCodeDataVersionMin.length);
  });
});
