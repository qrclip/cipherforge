import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CFFileHelper } from '../shared/helpers/cf-file.helper';
import {
  CipherforgeDecoded,
  CipherforgeDecodeDataReady,
  CipherforgeDecodedError,
  CipherforgeMode,
} from '../cf-core/cipherforge.types';
import { CFCameraScan } from '../shared/cf-camera.types';
import { CFKeyAndPassEvent } from './cf-key-and-pass/cf-key-and-pass.component';
import { CFCoreDecodeService } from '../cf-core/services/cf-core-decode.service';
import { CFToastService } from '../shared/cf-toast/cf-toast.service';
import { CFQRReadService } from '../cf-core/services/cf-qr-read.service';
import { CFTopMenuAction } from '../shared/cf-top-menu/cf-top-menu.component';

export interface DecodeChunk {
  index: number;
  ok: boolean;
}

@Component({
  selector: 'app-decode',
  templateUrl: './decode.component.html',
  styleUrls: ['./decode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CFCoreDecodeService, CFQRReadService],
})
export class DecodeComponent {
  public mUIState: 'initial' | 'working' | 'decoded' | 'scan' | 'keyAndPass' | 'error' = 'initial';
  public mMenuExpanded = true;
  public mMenuVisible = true;
  public mShowActionMenuButtons = true;
  public mCipherforgeDecoded: CipherforgeDecoded | null = null;
  public mChunks: DecodeChunk[] = [];
  public mScanInfo = ' ';
  public mCipherforgeMode: CipherforgeMode = CipherforgeMode.NONE;
  public mScanDetected = false;
  public mWorkingInfo = '';

  ////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(
    private mChangeDetectorRef: ChangeDetectorRef,
    private mRouter: Router,
    private mCFCoreDecodeService: CFCoreDecodeService,
    private mCFToastService: CFToastService,
    private mCFQRReadService: CFQRReadService
  ) {}

  ////////////////////////////////////////////////////
  // ON MENU BUTTON CLICKED
  onMenuButtonClicked(tButton: CFTopMenuAction, tFileInput: HTMLElement) {
    this.mChangeDetectorRef.detectChanges();
    switch (tButton) {
      case 'A':
        this.doScan().then();
        break;
      case 'B':
        tFileInput.click();
        break;
      case 'LOGO':
        this.menuLogoClicked();
        break;
    }
  }

  ////////////////////////////////////////////////////
  // MENU LOGO CLICKED
  private menuLogoClicked(): void {
    if (this.mUIState === 'scan') {
      this.onExitCamera().then();
    } else {
      this.mRouter.navigate(['/']).then();
    }
  }

  ////////////////////////////////////////////////////
  // ON FILES SELECTED
  async onFilesSelected(tEvent: Event) {
    this.mUIState = 'working';
    this.mMenuVisible = false;
    this.mMenuExpanded = false;
    this.mShowActionMenuButtons = false;
    this.mChangeDetectorRef.detectChanges();
    let tQRCodesFound = 0;
    if (tEvent.target && (tEvent.target as HTMLInputElement).files) {
      const tFiles = (tEvent.target as HTMLInputElement).files;
      if (tFiles) {
        let tImageCount = 0;
        for (let f = 0; f < tFiles.length; f++) {
          tImageCount++;
          this.mWorkingInfo = 'Processing image ' + tImageCount.toString() + ' of ' + tFiles.length.toString();
          this.mChangeDetectorRef.markForCheck();

          const tDataUrl = await CFFileHelper.readFileAsDataURL(tFiles[f]);
          const tQRCodeData = await this.mCFQRReadService.DecodeQRCodeFromImageData(tDataUrl);
          if (tQRCodeData.length > 0) {
            const tResp = await this.mCFCoreDecodeService.addQRCodeDecodeData(tQRCodeData);
            if (tResp.chunk || tResp.first) {
              tQRCodesFound++;
            }
          }
        }
      }
      this.mWorkingInfo = '';
      this.mChangeDetectorRef.markForCheck();
    }

    if (tQRCodesFound === 0) {
      this.mCFToastService.showWarning('Nothing found', 'No QR codes found...', 3000);
    }
    await this.finishedScanning();
  }

  ////////////////////////////////////////////////////
  // FINISHED SCANNING
  private async finishedScanning(): Promise<void> {
    this.mMenuVisible = true;
    const tDecodeDataReady = this.mCFCoreDecodeService.checkDecodeDataReady();
    this.mCipherforgeMode = this.mCFCoreDecodeService.getDecodeMode();
    if (tDecodeDataReady === CipherforgeDecodeDataReady.OK) {
      // IF DATA READY DISPLAY IT
      this.displayData().then();
      return;
    } else {
      if (
        tDecodeDataReady === CipherforgeDecodeDataReady.NO_DECODE_DATA ||
        tDecodeDataReady === CipherforgeDecodeDataReady.CHUNKS_MISSING
      ) {
        this.displayNotReady().then();
        return;
      }
      if (
        tDecodeDataReady === CipherforgeDecodeDataReady.NO_KEY ||
        tDecodeDataReady === CipherforgeDecodeDataReady.NO_PASSWORD
      ) {
        this.displayKeyAndPass().then();
        return;
      }
    }
    this.displayError().then();
  }

  ////////////////////////////////////////////////////
  // DISPLAY ERROR
  private async displayError(): Promise<void> {
    this.mUIState = 'error';
    this.mMenuExpanded = false;
    this.mMenuVisible = true;
    this.mShowActionMenuButtons = false;
    this.mChangeDetectorRef.detectChanges();
  }

  ////////////////////////////////////////////////////
  // DISPLAY KEY AND PASS
  private async displayKeyAndPass(): Promise<void> {
    this.mUIState = 'keyAndPass';
    this.mChangeDetectorRef.detectChanges();
  }

  ////////////////////////////////////////////////////
  // DISPLAY DATA
  private async displayData(): Promise<void> {
    if (this.mCFCoreDecodeService.checkDecodeDataReady() !== CipherforgeDecodeDataReady.OK) {
      this.displayError().then();
      return;
    }
    this.mMenuExpanded = false;
    this.mShowActionMenuButtons = false;
    this.mUIState = 'working';
    this.mWorkingInfo = 'Checking data ...';
    this.mChangeDetectorRef.detectChanges();

    // GET THE DECODED DATA
    this.mCipherforgeDecoded = await this.mCFCoreDecodeService.getDecodedData();

    if (this.mCipherforgeDecoded.error) {
      if (this.mCipherforgeDecoded.error === CipherforgeDecodedError.FAILED_TO_DECOMPRESS_DATA) {
        this.mCFToastService.showError('Failed', 'Failed to decompress data!', 0);
        this.displayError().then();
        return;
      }
      if (this.mCipherforgeMode !== CipherforgeMode.NONE) {
        this.displayKeyAndPass().then();
        if (this.mCipherforgeMode === CipherforgeMode.KEY) {
          this.mCFToastService.showWarning('Failed', 'Key not valid!', 3000);
        }
        if (this.mCipherforgeMode === CipherforgeMode.PASSWORD_ONLY) {
          this.mCFToastService.showWarning('Failed', 'Password not valid!', 3000);
        }
        if (this.mCipherforgeMode === CipherforgeMode.KEY_AND_PASSWORD) {
          this.mCFToastService.showWarning('Failed', 'Key or Password not valid!', 3000);
        }
      } else {
        this.displayError().then();
      }
    } else {
      // IF NO ENCRYPTION DISPLAY
      this.mUIState = 'decoded';
      this.mChangeDetectorRef.detectChanges();
    }
  }

  ////////////////////////////////////////////////////
  // DISPLAY NOT READY
  private async displayNotReady(): Promise<void> {
    // GET THE STATUS
    const tStatus = await this.mCFCoreDecodeService.getStatus();
    // FIND THE MAXIMUM CHUNK
    let tMaxChunk = 0;
    if (tStatus.chunkCount > 0) {
      tMaxChunk = tStatus.chunkCount;
    } else {
      for (const tChunk of tStatus.chunks) {
        if (tChunk > tMaxChunk) {
          tMaxChunk = tChunk;
        }
      }
    }

    // BUILD THE CHUNK ARRAY TO DISPLAY
    this.mChunks = [];
    for (let c = 0; c < tMaxChunk; c++) {
      let tOK = false;
      const tFoundAt = tStatus.chunks.indexOf(c);
      if (tFoundAt >= 0) {
        tOK = true;
      }
      this.mChunks.push({
        index: c,
        ok: tOK,
      });
    }

    this.mUIState = 'initial';
    this.mMenuVisible = true;
    if (this.mChunks.length > 0) {
      this.mMenuExpanded = false;
    } else {
      this.mMenuExpanded = true;
    }
    this.mShowActionMenuButtons = true;
    this.mChangeDetectorRef.detectChanges();
  }

  ////////////////////////////////////////////////////
  // DO SCAN
  private async doScan(): Promise<void> {
    this.mMenuExpanded = false;
    this.mShowActionMenuButtons = false;
    this.mUIState = 'scan';
    this.mChangeDetectorRef.detectChanges();
  }

  ////////////////////////////////////////////////////
  // ON EXIST CAMERA
  async onExitCamera(): Promise<void> {
    await this.finishedScanning();
  }

  ////////////////////////////////////////////////////
  // ON OPEN WITH KEY AND PASSWORD
  async onOpenWithKeyAndPassword(tCFKeyAndPassEvent: CFKeyAndPassEvent): Promise<void> {
    this.mUIState = 'working';
    this.mWorkingInfo = '';
    this.mChangeDetectorRef.detectChanges();

    if (
      tCFKeyAndPassEvent.password &&
      (this.mCipherforgeMode === CipherforgeMode.PASSWORD_ONLY ||
        this.mCipherforgeMode === CipherforgeMode.KEY_AND_PASSWORD)
    ) {
      await this.mCFCoreDecodeService.setDecodePassword(tCFKeyAndPassEvent.password);
    }

    if (
      tCFKeyAndPassEvent.key &&
      (this.mCipherforgeMode === CipherforgeMode.KEY || this.mCipherforgeMode === CipherforgeMode.KEY_AND_PASSWORD)
    ) {
      await this.mCFCoreDecodeService.setDecodeKey({ hex: tCFKeyAndPassEvent.key });
    }

    if (this.mCFCoreDecodeService.checkDecodeDataReady() === CipherforgeDecodeDataReady.OK) {
      this.displayData().then();
    }
  }

  ////////////////////////////////////////////////////
  // ON SCAN
  async onScan(tCFCameraScan: CFCameraScan): Promise<void> {
    if (tCFCameraScan.array) {
      this.mScanDetected = true;
      this.mChangeDetectorRef.detectChanges();
      setTimeout(() => {
        this.mScanDetected = false;
        this.mChangeDetectorRef.detectChanges();
      }, 400);

      await this.mCFCoreDecodeService.addQRCodeDecodeData(tCFCameraScan.array);
      const tDecodeDataReady = this.mCFCoreDecodeService.checkDecodeDataReady();
      if (
        tDecodeDataReady === CipherforgeDecodeDataReady.OK ||
        tDecodeDataReady === CipherforgeDecodeDataReady.NO_KEY ||
        tDecodeDataReady === CipherforgeDecodeDataReady.NO_PASSWORD
      ) {
        this.finishedScanning().then();
        return;
      }
      const tStatus = await this.mCFCoreDecodeService.getStatus();
      if (tStatus.chunkCount > 0) {
        this.mScanInfo =
          'Progress: ' +
          tStatus.chunkCount.toString() +
          ' of ' +
          tStatus.chunks.length.toString() +
          ' QR Codes Scanned';
      } else {
        if (tStatus.chunks.length === 1) {
          this.mScanInfo = 'Scanned one QR Code. Scan the first code to reveal total count.';
        } else {
          this.mScanInfo =
            'Scanned ' + tStatus.chunks.length.toString() + ' QR Codes. Scan the first code to reveal total count.';
        }
      }
      this.mChangeDetectorRef.detectChanges();
    }
  }
}
