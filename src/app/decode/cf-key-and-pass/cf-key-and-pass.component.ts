import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CipherforgeMode } from '../../cf-core/cipherforge.types';
import { CFToastService } from '../../shared/cf-toast/cf-toast.service';
import { CFCameraService } from '../../shared/cf-camera/cf-camera.service';
import { CFKeyHelper } from '../../cf-core/objects/cf-key.helper';

export interface CFKeyAndPassEvent {
  key?: string;
  password?: string;
}

@Component({
  selector: 'app-cf-key-and-pass',
  templateUrl: './cf-key-and-pass.component.html',
  styleUrls: ['./cf-key-and-pass.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CFKeyAndPassComponent {
  @Output() eOpen: EventEmitter<CFKeyAndPassEvent> = new EventEmitter<CFKeyAndPassEvent>();

  public mPassword = '';
  public mKey = '';

  @Input() mCipherforgeMode: CipherforgeMode = CipherforgeMode.NONE;

  CipherforgeMode = CipherforgeMode;

  ////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(
    private mCFToastService: CFToastService,
    private mCFCameraService: CFCameraService,
    private mChangeDetectorRef: ChangeDetectorRef
  ) {}

  ////////////////////////////////////////////////////
  // OPEN
  onOpen() {
    const tCFKeyAndPassEvent: CFKeyAndPassEvent = {};
    if (
      this.mCipherforgeMode === CipherforgeMode.PASSWORD_ONLY ||
      this.mCipherforgeMode === CipherforgeMode.KEY_AND_PASSWORD
    ) {
      if (this.mPassword === '') {
        this.mCFToastService.showError('Password required', 'Please input a password', 2000);
        return;
      }
      tCFKeyAndPassEvent.password = this.mPassword;
    }
    if (this.mCipherforgeMode === CipherforgeMode.KEY || this.mCipherforgeMode === CipherforgeMode.KEY_AND_PASSWORD) {
      if (this.mKey === '') {
        this.mCFToastService.showError('Key required', 'Please input a key', 2000);
        return;
      }
      tCFKeyAndPassEvent.key = this.mKey;
    }
    this.eOpen.next(tCFKeyAndPassEvent);
  }

  /* istanbul ignore next */
  ////////////////////////////////////////////////////
  // SCAN KEY
  async onScanKey(): Promise<void> {
    const tScanResult = await this.mCFCameraService.scanQRCode('Scan Key QR Code', 'string');
    if (tScanResult.string) {
      const tKey = CFKeyHelper.checkKey({ hex: tScanResult.string });
      if (tKey.hex) {
        this.mKey = tKey.hex;
        this.mChangeDetectorRef.markForCheck();
      }
    }
  }
}
