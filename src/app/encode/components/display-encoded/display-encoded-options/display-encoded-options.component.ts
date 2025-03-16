import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CipherforgeEncodeOptions } from '../../../../cf-core/cipherforge.types';

interface OptionValue {
  name: string;
  code: string;
}

@Component({
  selector: 'app-display-encoded-options',
  templateUrl: './display-encoded-options.component.html',
  styleUrls: ['./display-encoded-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayEncodedOptionsComponent {
  public mOptions: CipherforgeEncodeOptions | null = null;

  mErrorCorrections: OptionValue[] = [
    { name: 'Level L (Low)', code: 'L' },
    { name: 'Level M (Medium)', code: 'M' },
    { name: 'Level Q (Quartile)', code: 'Q' },
    { name: 'Level H (High)', code: 'H' },
  ];
  mSelectedErrorCorrection: OptionValue = this.mErrorCorrections[0];

  mVersion: OptionValue[] = [
    { name: '10', code: '10' },
    { name: '20', code: '20' },
    { name: '30', code: '30' },
    { name: '40', code: '40' },
  ];
  mSelectedVersion: OptionValue = this.mVersion[0];

  ///////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(
    private mConfig: DynamicDialogConfig,
    private mDynamicDialogRef: DynamicDialogRef
  ) {
    const tData = this.mConfig.data;
    if (tData.options) {
      this.mOptions = tData.options;
      if (this.mOptions) {
        for (const tVersion of this.mVersion) {
          if (tVersion.code === this.mOptions.version) {
            this.mSelectedVersion = tVersion;
          }
        }
        for (const tError of this.mErrorCorrections) {
          if (tError.code === this.mOptions.errorCorrection) {
            this.mSelectedErrorCorrection = tError;
          }
        }
      }
    }
  }

  ///////////////////////////////////////////////////////
  // ON OK
  onOK(): void {
    this.mDynamicDialogRef.close({
      version: this.mSelectedVersion.code,
      errorCorrection: this.mSelectedErrorCorrection.code,
    });
  }
}
