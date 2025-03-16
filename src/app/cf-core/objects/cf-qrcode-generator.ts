import * as QRCode from 'qrcode';
import { QRCodeToDataURLOptions } from 'qrcode';
import { CFErrorCorrectionLevel, CFQRCodeVersion } from '../cipherforge.types';

export class CFQRCodeGenerator {
  ////////////////////////////////////////////////////////////
  // DOWNLOAD QR CODE
  public async downloadQRCode(
    tData: Uint8Array,
    tFilename: string,
    tForceVersion40: boolean,
    tVersion: CFQRCodeVersion,
    tErrorCorrection: CFErrorCorrectionLevel
  ): Promise<boolean> {
    try {
      const tQRCodeBuffer = await this.generateDataURL(tData, tForceVersion40, tVersion, tErrorCorrection);
      await this.download(tQRCodeBuffer, tFilename);
      return true;
    } catch (e) {
      /* istanbul ignore next */
      return false;
    }
  }

  ////////////////////////////////////////////////////////////
  // GENERATE QR CODE
  public async generateDataURL(
    tData: Uint8Array,
    tForceVersion: boolean,
    tVersion: CFQRCodeVersion,
    tErrorCorrection: CFErrorCorrectionLevel
  ): Promise<string> {
    try {
      const tOptions: QRCodeToDataURLOptions = {
        errorCorrectionLevel: tErrorCorrection,
      };
      if (tForceVersion) {
        tOptions.version = +tVersion;
      }
      return QRCode.toDataURL([{ mode: 'byte', data: tData }], tOptions);
    } catch (err) {
      /* istanbul ignore next */
      return '';
    }
  }

  /* istanbul ignore next: manual tested if changed */
  ////////////////////////////////////////////////////////////
  // DOWNLOAD
  private async download(tQRCodeData: string, tFilename: string): Promise<void> {
    return new Promise(resolve => {
      const a = document.createElement('a');
      a.href = tQRCodeData;
      a.download = tFilename;

      // Event listener to resolve the promise after the download starts
      a.addEventListener(
        'click',
        () => {
          resolve();
        },
        { once: true }
      );

      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }
}
