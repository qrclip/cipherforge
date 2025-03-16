import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CFCameraScan } from '../../cf-camera.types';

@Component({
  selector: 'app-cf-camera-dialog',
  templateUrl: './cf-camera-dialog.component.html',
  styleUrls: ['./cf-camera-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CFCameraDialogComponent {
  mScanMode: 'binary' | 'string' = 'binary';

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(
    private mDynamicDialogRef: DynamicDialogRef,
    public mConfig: DynamicDialogConfig
  ) {
    if (this.mConfig.data && this.mConfig.data.mode) {
      this.mScanMode = this.mConfig.data.mode;
    }
  }

  /* istanbul ignore next */
  ///////////////////////////////////////////////////
  // ON SCAN
  onScan(tCFCameraScan: CFCameraScan) {
    if (this.mScanMode === 'binary') {
      this.mDynamicDialogRef.close({ array: tCFCameraScan.array });
      return;
    }
    if (this.mScanMode === 'string') {
      this.mDynamicDialogRef.close({ string: tCFCameraScan.string });
      return;
    }
    this.mDynamicDialogRef.close({});
  }
}
