import { Injectable, OnDestroy } from '@angular/core';
import { CF_WEBWORKER_QR_READ_NAME } from '../cf-constants';
import {
  CFQRReadWorkerCMDRead,
  CFQRReadWorkerCMDReadType,
  CFQRReadWorkerCommand,
  CFQRReadWorkerCommandType,
  CFQRReadWorkerResponse,
} from '../../../../workers/cipherforge-qr-read-worker/src/cipherforge-qr-read-lib.types';

@Injectable()
export class CFQRReadService implements OnDestroy {
  private mWorker: Worker | null = null;

  /////////////////////////////////////////////////////////////////////////
  // ON DESTROY
  ngOnDestroy(): void {
    this.terminate();
  }

  /////////////////////////////////////////////////////////////////////////
  // TERMINATE
  private terminate(): void {
    if (this.mWorker) {
      this.mWorker.terminate();
    }
  }

  ///////////////////////////////////////////////////////////////
  // DECODE QR CODE FROM IMAGE
  public async DecodeQRCodeFromImageData(tDataUrl: string): Promise<Uint8Array> {
    const tResp = await this.dataUrlToArray(tDataUrl);
    if (tResp.width === 0) {
      return new Uint8Array(0);
    }
    const tWorkerResp = await this.ReadQRCode({
      type: CFQRReadWorkerCMDReadType.BINARY,
      data: tResp.data,
      width: tResp.width,
      height: tResp.height,
    });
    if (tWorkerResp.cmd === CFQRReadWorkerCommandType.READ_QR_CODE) {
      if (tWorkerResp.dataArray) {
        return tWorkerResp.dataArray;
      }
    }
    return new Uint8Array(0);
  }

  ///////////////////////////////////////////////////////////////
  // DECODE QR CODE FROM IMAGE
  public dataUrlToArray(tDataUrl: string): Promise<{
    data: Uint8ClampedArray;
    width: number;
    height: number;
  }> {
    return new Promise(resolve => {
      {
        const tCanvas = document.createElement('canvas') as HTMLCanvasElement;
        const tContext = tCanvas.getContext('2d');
        /* istanbul ignore if */
        if (!tContext) {
          resolve({
            data: new Uint8ClampedArray(0),
            width: 0,
            height: 0,
          });
          return;
        }

        const tImage = new Image();
        tImage.onload = function () {
          tCanvas.width = tImage.width;
          tCanvas.height = tImage.height;
          tContext.drawImage(tImage, 0, 0, tCanvas.width, tCanvas.height);
          const tImageData = tContext.getImageData(0, 0, tCanvas.width, tCanvas.height);
          resolve({
            data: tImageData.data,
            width: tCanvas.width,
            height: tCanvas.height,
          });
        };
        tImage.onerror = function () {
          resolve({
            data: new Uint8ClampedArray(0),
            width: 0,
            height: 0,
          });
        };
        tImage.src = tDataUrl;
      }
    });
  }

  /////////////////////////////////////////////////////////////////////////
  // READ QR CODE
  public async ReadQRCode(tCmd: CFQRReadWorkerCMDRead): Promise<CFQRReadWorkerResponse> {
    const tResp = await this.call({
      cmd: CFQRReadWorkerCommandType.READ_QR_CODE,
      read: tCmd,
    });

    if (tResp.cmd === CFQRReadWorkerCommandType.READ_QR_CODE) {
      if (tResp) {
        return tResp;
      }
    }

    /* istanbul ignore next */
    return {
      cmd: CFQRReadWorkerCommandType.READ_QR_CODE,
      error: true,
    };
  }

  /////////////////////////////////////////////////////////////////////////
  // CALL WORKER
  private async call(tCmd: CFQRReadWorkerCommand): Promise<CFQRReadWorkerResponse> {
    if (!this.mWorker) {
      this.mWorker = new Worker('assets/workers/' + CF_WEBWORKER_QR_READ_NAME);
    }

    return new Promise((resolve, reject) => {
      /* istanbul ignore if */
      if (!this.mWorker) {
        reject(new Error('Worker not available.'));
        return;
      }

      // Message handler
      const messageHandler = ({ data }: MessageEvent) => {
        if (data && this.mWorker) {
          this.mWorker.removeEventListener('message', messageHandler);
          this.mWorker.removeEventListener('error', errorHandler);
          resolve(data);
          return;
        }
        /* istanbul ignore next */
        reject(new Error('No data received from worker.'));
      };

      // Error handler
      /* istanbul ignore next */
      const errorHandler = (error: ErrorEvent) => {
        if (this.mWorker) {
          this.mWorker.removeEventListener('message', messageHandler);
          this.mWorker.removeEventListener('error', errorHandler);
        }
        reject(error);
      };

      this.mWorker.addEventListener('message', messageHandler);
      this.mWorker.addEventListener('error', errorHandler);

      // TRANSFERRING DATA
      if (tCmd.read && tCmd.read.data) {
        this.mWorker.postMessage(tCmd, [tCmd.read.data.buffer]);
        return;
      }
      /* istanbul ignore next */
      this.mWorker.postMessage(tCmd);
    });
  }
}
