import { Subject } from 'rxjs';
import {
  CFQRReadWorkerCMDRead,
  CFQRReadWorkerCMDReadType,
  CFQRReadWorkerCommand,
  CFQRReadWorkerCommandType,
  CFQRReadWorkerResponse,
} from './cipherforge-qr-read-lib.types';
import jsQR from 'jsqr';

export class CipherforgeQRReadWorkerCore {
  public mResponse = new Subject<CFQRReadWorkerResponse>();

  /////////////////////////////////////////////////
  // HANDLE MESSAGE
  public async HandleMessage(tCommand: CFQRReadWorkerCommand): Promise<void> {
    switch (tCommand.cmd) {
      case CFQRReadWorkerCommandType.READ_QR_CODE:
        await this.readQRCode(tCommand.read);
        break;
    }
  }

  /////////////////////////////////////////////////
  // SEND ERROR BAD COMMAND
  private async readQRCode(tCFQRReadWorkerCMDRead: CFQRReadWorkerCMDRead | undefined): Promise<void> {
    if (!tCFQRReadWorkerCMDRead) {
      this.mResponse.next({
        cmd: CFQRReadWorkerCommandType.ERROR_BAD_COMMAND,
      });
      return;
    }

    const tCode = jsQR(tCFQRReadWorkerCMDRead.data, tCFQRReadWorkerCMDRead.width, tCFQRReadWorkerCMDRead.height, {
      inversionAttempts: 'dontInvert',
    });
    if (tCode) {
      if (tCFQRReadWorkerCMDRead.type === CFQRReadWorkerCMDReadType.BINARY) {
        this.mResponse.next({
          cmd: CFQRReadWorkerCommandType.READ_QR_CODE,
          dataArray: new Uint8Array(tCode.binaryData),
        });
      }
      if (tCFQRReadWorkerCMDRead.type === CFQRReadWorkerCMDReadType.STRING) {
        this.mResponse.next({
          cmd: CFQRReadWorkerCommandType.READ_QR_CODE,
          dataString: tCode.data,
        });
      }
    } else {
      this.mResponse.next({
        cmd: CFQRReadWorkerCommandType.READ_QR_CODE,
      });
    }
  }
}
