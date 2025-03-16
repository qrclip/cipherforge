import { Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { CFShareKeyDialogComponent } from './cf-share-key-dialog/cf-share-key-dialog.component';
import { CipherforgeKey } from '../../../../workers/cipherforge-crypto-worker/src/cipherforge-crypto-lib.types';

@Injectable({
  providedIn: 'root',
})
export class CFShareKeyService {
  //////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(private mDialogService: DialogService) {}

  /* istanbul ignore next */
  //////////////////////////////////////////////////////////////////////////////
  // SCAN QRCODE
  public async shareKey(tKey: CipherforgeKey): Promise<void> {
    return new Promise(() => {
      this.mDialogService.open(CFShareKeyDialogComponent, {
        showHeader: true,
        header: 'Key',
        closeOnEscape: true,
        dismissableMask: true,
        data: {
          key: tKey,
        },
      });
    });
  }
}
