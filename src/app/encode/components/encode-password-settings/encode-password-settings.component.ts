import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import {
  CF_DEFAULT_PASS_LEVEL_MEM,
  CF_DEFAULT_PASS_LEVEL_OPS,
  CipherforgePassLevel,
} from '../../../cf-core/cipherforge.types';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CFCrypto } from '../../../cf-core/objects/cf-crypto';

interface PasswordSettingTemplate {
  name: string;
  code: string;
}

@Component({
  selector: 'app-encode-password-settings',
  templateUrl: './encode-password-settings.component.html',
  styleUrls: ['./encode-password-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncodePasswordSettingsComponent implements OnDestroy {
  public mUIState: 'form' | 'working' = 'form';
  public mLastTestLabel = '';

  private mCFCrypto: CFCrypto = new CFCrypto();

  mTemplates: PasswordSettingTemplate[] = [
    { name: 'Minimum', code: '1' },
    { name: 'Medium', code: '2' },
    { name: 'High', code: '3' },
    { name: 'Ultra', code: '4' },
  ];
  mSelectedTemplate: PasswordSettingTemplate = { name: '', code: '' };

  public mCipherforgePassLevel: CipherforgePassLevel = {
    ops: CF_DEFAULT_PASS_LEVEL_OPS,
    mem: CF_DEFAULT_PASS_LEVEL_MEM,
  };

  ///////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(
    private mConfig: DynamicDialogConfig,
    private mDynamicDialogRef: DynamicDialogRef,
    private mChangeDetector: ChangeDetectorRef
  ) {
    const tData = this.mConfig.data;
    if (tData.level) {
      this.mCipherforgePassLevel = tData.level;
    }
  }

  ///////////////////////////////////////////////////////
  // ON DESTROY
  ngOnDestroy(): void {
    this.mCFCrypto.terminate();
  }

  ///////////////////////////////////////////////////////
  // ON TEMPLATE CHANGED
  async onTemplateChanged(): Promise<void> {
    // DEFAULT
    if (this.mSelectedTemplate.code === '1') {
      this.mCipherforgePassLevel = {
        ops: 3,
        mem: 3,
      };
    }

    // MEDIUM
    if (this.mSelectedTemplate.code === '2') {
      this.mCipherforgePassLevel = {
        ops: 4,
        mem: 10,
      };
    }

    // HIGH
    if (this.mSelectedTemplate.code === '3') {
      this.mCipherforgePassLevel = {
        ops: 20,
        mem: 10,
      };
    }

    // ULTRA
    if (this.mSelectedTemplate.code === '4') {
      this.mCipherforgePassLevel = {
        ops: 40,
        mem: 20,
      };
    }
  }

  ///////////////////////////////////////////////////////
  // ON OK
  async onOK(): Promise<void> {
    this.mDynamicDialogRef.close({ level: this.mCipherforgePassLevel });
  }

  ///////////////////////////////////////////////////////
  // ON TEST
  /* istanbul ignore next */
  async onTest(): Promise<void> {
    this.mUIState = 'working';
    this.mChangeDetector.detectChanges();

    const tStartTime = performance.now();

    // JUST TO TEST
    await this.mCFCrypto.generateKeyFromPassword({
      password: 'Password1234',
      level: this.mCipherforgePassLevel,
      salt: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
    });

    const tEndTime = performance.now();
    const tSecondsTaken = Math.ceil((tEndTime - tStartTime) / 1000);
    this.mLastTestLabel = 'Last test took ' + tSecondsTaken + ' seconds.';
    this.mUIState = 'form';
    this.mChangeDetector.detectChanges();
  }
}
