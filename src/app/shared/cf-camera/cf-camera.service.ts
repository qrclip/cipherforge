import { Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { CFCameraDialogComponent } from './cf-camera-dialog/cf-camera-dialog.component';

export interface CFCameraServiceResult {
  array?: Uint8Array;
  string?: string;
}
@Injectable({
  providedIn: 'root',
})
export class CFCameraService {
  //////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(private mDialogService: DialogService) {}

  /* istanbul ignore next: prefer manual testing for this one */
  //////////////////////////////////////////////////////////////////////////////
  // SCAN QRCODE
  public async scanQRCode(tTitle: string, tMode: 'binary' | 'string'): Promise<CFCameraServiceResult> {
    return new Promise(resolve => {
      const tDialogRef = this.mDialogService.open(CFCameraDialogComponent, {
        showHeader: true,
        header: tTitle,
        closeOnEscape: true,
        dismissableMask: true,
        data: {
          mode: tMode,
        },
      });

      // ON CLOSE
      tDialogRef.onClose.subscribe(tValue => {
        if (tValue) {
          if (tValue.array) {
            resolve({ array: tValue.array });
          }
          if (tValue.string) {
            resolve({ string: tValue.string });
          }
        }
      });
    });
  }
}
