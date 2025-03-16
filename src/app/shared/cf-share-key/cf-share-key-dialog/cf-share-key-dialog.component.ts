import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import QRCodeStyling from 'qr-code-styling';
import { CipherforgeKey } from '../../../../../workers/cipherforge-crypto-worker/src/cipherforge-crypto-lib.types';

@Component({
  selector: 'app-cf-share-key-dialog',
  templateUrl: './cf-share-key-dialog.component.html',
  styleUrls: ['./cf-share-key-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CFShareKeyDialogComponent implements AfterViewInit {
  mKey: CipherforgeKey | null = null;

  // VIEW CHILD'S
  @ViewChild('canvas', { static: true }) mCanvas: ElementRef | null = null;

  mQRCodeStyling: QRCodeStyling | null = null;

  ///////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(
    public mConfig: DynamicDialogConfig,
    private mChangeDetector: ChangeDetectorRef
  ) {
    const tData = mConfig.data;
    /* istanbul ignore if */
    if (tData.key) {
      this.mKey = tData.key;
    }
  }

  ///////////////////////////////////////////////////////////////
  // ngAfterViewInit
  async ngAfterViewInit() {
    this.updateQRCode().then();
  }

  ///////////////////////////////////////////////////////
  // UPDATE QR CODE
  private async updateQRCode(): Promise<void> {
    /* istanbul ignore next */
    if (!QRCodeStyling || !this.mCanvas) {
      return;
    }
    this.mQRCodeStyling = new QRCodeStyling({
      width: 256,
      height: 256,
      margin: 5,
      type: 'canvas',
      data: this.mKey?.hex,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 3,
        imageSize: 0.2,
        hideBackgroundDots: true,
      },
      image: '/assets/images/cipherforge-icon.svg',
      dotsOptions: {
        color: '#000000',
        type: 'rounded',
      },
      backgroundOptions: {
        color: '#ffffff', // ALWAYS WHITE
      },
      qrOptions: {
        errorCorrectionLevel: 'Q',
      },
      cornersSquareOptions: {
        type: 'dot',
      },
      cornersDotOptions: {
        type: 'dot',
      },
    });
    this.mQRCodeStyling.append(this.mCanvas.nativeElement);
    this.mChangeDetector.markForCheck();
  }

  /* istanbul ignore next */
  /////////////////////////////////////////////
  // GET IMAGE DATA
  async getImageData(): Promise<ArrayBuffer | null> {
    if (this.mQRCodeStyling) {
      try {
        const tBlob = await this.mQRCodeStyling.getRawData('png') as Blob;
        if (tBlob instanceof Blob) {
          return tBlob.arrayBuffer();
        } else if (tBlob) {
          // Handle Buffer
          return Buffer.from(tBlob).buffer;
        } else if (tBlob === null) {
          // Handle null
        }
      } catch (e) {
        /* istanbul ignore next */
        return null;
      }
    }
    /* istanbul ignore next */
    return null;
  }

  /* istanbul ignore next */
  /////////////////////////////////////////////////////////////////
  // ON DOWNLOAD QR CODE
  async onDownloadQRCode() {
    const tArrayBuffer = await this.getImageData();
    if (tArrayBuffer) {
      const tBlob = new Blob([tArrayBuffer], { type: 'image/png' });
      const tFileName = 'cipherforge-key.png';

      // SAVE FILE
      await this.SaveFile(tFileName, tBlob);
    }
  }

  /* istanbul ignore next */
  /////////////////////////////////////////////////////////////////
  // SAVE FILE
  private async SaveFile(tFileName: string, tBlob: Blob): Promise<void> {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(tBlob);
    link.download = tFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
